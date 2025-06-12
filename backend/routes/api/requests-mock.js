const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/roleAuth');
const { getMockUsers } = require('./users-mock');

// Mock data storage
let mockRequests = [];
let requestIdCounter = 1;

// Helper function to get mock requests
const getMockRequests = () => mockRequests;

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
      check('urgency', 'Urgency must be valid').isIn(['low', 'medium', 'high', 'critical'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { itemType, quantity, urgency, description } = req.body;
      
      const newRequest = {
        _id: `request_${requestIdCounter++}`,
        recipient: req.user.id,
        itemType,
        quantity,
        urgency,
        description,
        status: 'pending',
        requestDate: new Date(),
        createdAt: new Date()
      };
      
      mockRequests.push(newRequest);
      
      // Populate recipient info for response
      const mockUsers = getMockUsers();
      const recipient = mockUsers.find(u => u._id === req.user.id);
      if (recipient) {
        newRequest.recipient = { _id: recipient._id, name: recipient.name, organization: recipient.organization };
      }
      
      res.json({
        request: newRequest,
        potentialMatches: []
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/requests
// @desc    Get all requests
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let requests;
    const mockUsers = getMockUsers();
    
    // Filter by role
    if (req.user.role === 'recipient') {
      requests = mockRequests.filter(r => r.recipient === req.user.id || r.recipient._id === req.user.id);
    } else {
      // Admin and donors can see all requests
      requests = [...mockRequests];
    }
    
    // Populate recipient info
    requests = requests.map(request => {
      const recipientInfo = mockUsers.find(u => u._id === request.recipient || u._id === request.recipient._id);
      
      return {
        ...request,
        recipient: recipientInfo ? { _id: recipientInfo._id, name: recipientInfo.name, organization: recipientInfo.organization } : request.recipient
      };
    });
    
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
module.exports.getMockRequests = getMockRequests;