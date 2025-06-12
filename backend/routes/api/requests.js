const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/roleAuth');
const Request = require('../../models/Request');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const matchingService = require('../../services/matchingService');

// Helper function for notifications
async function createNotification(recipientId, message, type, donationId = null, requestId = null, options = {}) {
  try {
    let recipient = recipientId;
    if (recipientId === 'admin') {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) recipient = adminUser._id;
      else return;
    }
    
    const notification = new Notification({
      recipient,
      message,
      type,
      relatedDonation: donationId,
      relatedRequest: requestId,
      ...options
    });
    
    await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// @route   POST api/requests
// @desc    Create a request
// @access  Private/Recipient
router.post(
  '/',
  [
    auth,
    roleAuth(['recipient']),
    [
      check('itemType', 'Item type is required').not().isEmpty(),
      check('quantity', 'Quantity is required').isInt({ min: 1 }),
      check('urgency', 'Urgency must be valid').isIn(['low', 'medium', 'high', 'critical']),
      check('description', 'Description is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { 
        itemType, 
        quantity, 
        urgency, 
        description, 
        location, 
        contactInfo, 
        expectedDelivery,
        specialInstructions,
        isPublic 
      } = req.body;
      
      const newRequest = new Request({
        recipient: req.user.id,
        itemType,
        quantity,
        urgency,
        description,
        location,
        contactInfo,
        expectedDelivery,
        specialInstructions,
        isPublic: isPublic !== false // Default to true
      });
      
      await newRequest.save();
      
      // Notify admin about new request
      await createNotification(
        'admin',
        `New ${urgency} priority request for ${itemType} from ${req.user.name}`,
        'request_created',
        null,
        newRequest._id,
        { 
          priority: urgency === 'critical' ? 'urgent' : 'medium',
          actionUrl: `/admin/requests/${newRequest._id}`
        }
      );
      
      // Find potential matches
      const matches = await matchingService.findMatchesForRequest(newRequest._id);
      
      res.json({
        request: newRequest,
        potentialMatches: matches,
        message: 'Request created successfully'
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/requests/available
// @desc    Get available requests for donors to fulfill
// @access  Private/Donor
router.get('/available', [auth, roleAuth(['donor'])], async (req, res) => {
  try {
    const { page = 1, limit = 10, urgency, itemType, location } = req.query;
    
    const query = { 
      status: { $in: ['pending', 'partially_fulfilled'] },
      isPublic: true
    };
    
    if (urgency) query.urgency = urgency;
    if (itemType) query.itemType = { $regex: itemType, $options: 'i' };
    
    const availableRequests = await Request.find(query)
      .populate('recipient', 'name organization location')
      .sort({ urgency: 1, requestDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Request.countDocuments(query);
    
    res.json({
      requests: availableRequests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/requests
// @desc    Get requests based on user role
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, urgency } = req.query;
    let query = {};
    
    // Filter by role
    if (req.user.role === 'recipient') {
      query.recipient = req.user.id;
    }
    // Admin and donors can see all public requests
    else if (req.user.role === 'donor') {
      query.isPublic = true;
    }
    
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    
    const requests = await Request.find(query)
      .populate('recipient', 'name organization')
      .populate('relatedDonations')
      .populate('fulfilledBy', 'name')
      .sort({ urgency: 1, requestDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Request.countDocuments(query);
    
    res.json({
      requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/requests/:id
// @desc    Update a request
// @access  Private/Recipient
router.put(
  '/:id',
  [
    auth,
    roleAuth(['recipient']),
    [
      check('itemType', 'Item type is required').optional().not().isEmpty(),
      check('quantity', 'Quantity must be positive').optional().isInt({ min: 1 }),
      check('urgency', 'Urgency must be valid').optional().isIn(['low', 'medium', 'high', 'critical'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const request = await Request.findById(req.params.id);
      
      if (!request) {
        return res.status(404).json({ msg: 'Request not found' });
      }
      
      // Check ownership
      if (request.recipient.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
      
      // Don't allow updates if already fulfilled
      if (request.status === 'fulfilled') {
        return res.status(400).json({ msg: 'Cannot update fulfilled request' });
      }
      
      const updateFields = ['itemType', 'quantity', 'urgency', 'description', 'location', 'contactInfo', 'specialInstructions', 'isPublic'];
      updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          request[field] = req.body[field];
        }
      });
      
      await request.save();
      
      // Notify admin about update
      await createNotification(
        'admin',
        `Request for ${request.itemType} has been updated by ${req.user.name}`,
        'request_updated',
        null,
        request._id,
        { priority: 'low' }
      );
      
      res.json({ request, message: 'Request updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/requests/:id
// @desc    Cancel a request
// @access  Private/Recipient
router.delete('/:id', [auth, roleAuth(['recipient'])], async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }
    
    // Check ownership
    if (request.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Don't allow cancellation if already fulfilled
    if (request.status === 'fulfilled') {
      return res.status(400).json({ msg: 'Cannot cancel fulfilled request' });
    }
    
    request.status = 'cancelled';
    await request.save();
    
    res.json({ message: 'Request cancelled successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;