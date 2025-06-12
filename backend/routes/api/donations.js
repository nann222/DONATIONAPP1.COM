const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/roleAuth');
const Donation = require('../../models/Donation');
const Request = require('../../models/Request');
const Item = require('../../models/Item');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const matchingService = require('../../services/matchingService');

// Helper function to create notifications
async function createNotification(recipientId, message, type, donationId = null, requestId = null, options = {}) {
  try {
    let recipient = recipientId;
    
    // Handle admin notifications
    if (recipientId === 'admin') {
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        console.log('No admin user found for notification');
        return;
      }
      recipient = adminUser._id;
    }
    
    const notification = new Notification({
      recipient,
      message,
      type,
      relatedDonation: donationId,
      relatedRequest: requestId,
      priority: options.priority || 'medium',
      actionRequired: options.actionRequired || false,
      actionUrl: options.actionUrl,
      expiresAt: options.expiresAt
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// @route   POST api/donations
// @desc    Create a donation (standalone or in response to request)
// @access  Private/Donor
router.post(
  '/',
  [
    auth,
    roleAuth(['donor']),
    [
      check('items', 'Items are required').isArray({ min: 1 }),
      check('description', 'Description is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { items, description, relatedRequestId, priority, estimatedDelivery } = req.body;
      
      // Create items first
      const itemIds = [];
      for (const itemData of items) {
        const newItem = new Item({
          ...itemData,
          donor: req.user.id
        });
        await newItem.save();
        itemIds.push(newItem._id);
      }
      
      // Create donation
      const donationData = {
        donor: req.user.id,
        items: itemIds,
        description,
        priority: priority || 'medium',
        estimatedDelivery
      };
      
      // If responding to a request, link it
      if (relatedRequestId) {
        const request = await Request.findById(relatedRequestId).populate('recipient');
        if (!request) {
          return res.status(404).json({ msg: 'Request not found' });
        }
        if (request.status === 'fulfilled' || request.status === 'cancelled') {
          return res.status(400).json({ msg: 'Request is no longer available' });
        }
        
        donationData.relatedRequest = relatedRequestId;
        donationData.recipient = request.recipient._id;
        donationData.priority = request.urgency === 'critical' ? 'urgent' : 'high';
      }
      
      const newDonation = new Donation(donationData);
      await newDonation.save();
      
      // Update request status if applicable
      if (relatedRequestId) {
        const request = await Request.findById(relatedRequestId);
        request.status = 'matched';
        request.relatedDonations.push(newDonation._id);
        await request.save();
        
        // Notify admin about donation response to request
        await createNotification(
          'admin',
          `New donation response to ${request.itemType} request from ${req.user.name}`,
          'donation_response',
          newDonation._id,
          relatedRequestId,
          { priority: 'high', actionRequired: true, actionUrl: `/admin/donations/${newDonation._id}` }
        );
        
        // Notify recipient about potential fulfillment
        await createNotification(
          request.recipient,
          `A donor has responded to your ${request.itemType} request! Awaiting admin approval.`,
          'donation_matched',
          newDonation._id,
          relatedRequestId,
          { priority: 'medium' }
        );
      } else {
        // Notify admin about new standalone donation
        await createNotification(
          'admin',
          `New donation submitted by ${req.user.name} for approval`,
          'donation_submitted',
          newDonation._id,
          null,
          { priority: 'medium', actionRequired: true, actionUrl: `/admin/donations/${newDonation._id}` }
        );
      }
      
      // Find potential matches for standalone donations
      let potentialMatches = [];
      if (!relatedRequestId) {
        potentialMatches = await matchingService.findMatchesForDonation(newDonation._id);
      }
      
      res.json({
        donation: newDonation,
        potentialMatches,
        message: 'Donation submitted for admin approval'
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/donations/:id/approve
// @desc    Approve a donation (Admin only)
// @access  Private/Admin
router.put(
  '/:id/approve',
  [auth, roleAuth(['admin'])],
  async (req, res) => {
    try {
      const { assignRecipient, logisticsNotes } = req.body;
      
      const donation = await Donation.findById(req.params.id)
        .populate('donor', 'name email')
        .populate('recipient', 'name email')
        .populate('relatedRequest')
        .populate('items');
      
      if (!donation) {
        return res.status(404).json({ msg: 'Donation not found' });
      }
      
      if (donation.status !== 'pending') {
        return res.status(400).json({ msg: 'Donation is not pending approval' });
      }
      
      // Update donation status
      donation.status = 'approved';
      donation.approvedBy = req.user.id;
      donation.approvalDate = new Date();
      
      // If admin assigns a recipient for standalone donation
      if (assignRecipient && !donation.relatedRequest) {
        donation.recipient = assignRecipient;
      }
      
      await donation.save();
      
      // If this donation was in response to a request
      if (donation.relatedRequest) {
        const request = await Request.findById(donation.relatedRequest._id);
        request.status = 'fulfilled';
        request.fulfilledBy = donation.donor._id;
        
        // Calculate fulfilled quantity
        const donatedQuantity = donation.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        request.quantityFulfilled += donatedQuantity;
        
        if (request.quantityFulfilled >= request.quantity) {
          request.status = 'fulfilled';
        } else {
          request.status = 'partially_fulfilled';
        }
        
        await request.save();
        
        // Notify recipient about approved donation
        await createNotification(
          request.recipient,
          `Great news! Your request for ${request.itemType} has been approved and will be fulfilled soon.`,
          'request_fulfilled',
          donation._id,
          request._id,
          { priority: 'high' }
        );
      }
      
      // Notify donor about approval
      await createNotification(
        donation.donor._id,
        `Your donation has been approved! It will be processed and delivered soon.`,
        'donation_approved',
        donation._id,
        null,
        { priority: 'medium' }
      );
      
      // If recipient is assigned, notify them
      if (donation.recipient) {
        await createNotification(
          donation.recipient,
          `You have been selected to receive a donation! Details will follow soon.`,
          'donation_received',
          donation._id,
          null,
          { priority: 'high' }
        );
      }
      
      res.json({ 
        donation, 
        message: 'Donation approved successfully' 
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/donations/:id/reject
// @desc    Reject a donation (Admin only)
// @access  Private/Admin
router.put(
  '/:id/reject',
  [
    auth, 
    roleAuth(['admin']),
    [check('reason', 'Rejection reason is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { reason } = req.body;
      const donation = await Donation.findById(req.params.id)
        .populate('donor', 'name email')
        .populate('relatedRequest');
      
      if (!donation) {
        return res.status(404).json({ msg: 'Donation not found' });
      }
      
      if (donation.status !== 'pending') {
        return res.status(400).json({ msg: 'Donation is not pending approval' });
      }
      
      // Update donation status
      donation.status = 'rejected';
      donation.rejectionReason = reason;
      donation.approvedBy = req.user.id;
      donation.approvalDate = new Date();
      await donation.save();
      
      // If this was in response to a request, update request status
      if (donation.relatedRequest) {
        const request = await Request.findById(donation.relatedRequest._id);
        request.status = 'pending'; // Back to pending for other donors
        request.relatedDonations.pull(donation._id);
        await request.save();
        
        // Notify recipient about rejection
        await createNotification(
          request.recipient,
          `Unfortunately, the donation response to your ${request.itemType} request was not approved. Your request is still active for other donors.`,
          'donation_rejected',
          donation._id,
          request._id,
          { priority: 'medium' }
        );
      }
      
      // Notify donor about rejection
      await createNotification(
        donation.donor._id,
        `Your donation was not approved. Reason: ${reason}. Thank you for your willingness to help!`,
        'donation_rejected',
        donation._id,
        null,
        { priority: 'medium' }
      );
      
      res.json({ 
        donation, 
        message: 'Donation rejected' 
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/donations/pending
// @desc    Get pending donations for admin approval
// @access  Private/Admin
router.get('/pending', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const { page = 1, limit = 10, priority, type } = req.query;
    
    const query = { status: 'pending' };
    if (priority) query.priority = priority;
    if (type === 'request-response') query.relatedRequest = { $exists: true };
    if (type === 'standalone') query.relatedRequest = { $exists: false };
    
    const pendingDonations = await Donation.find(query)
      .populate('donor', 'name email phone')
      .populate('recipient', 'name email organization')
      .populate('relatedRequest')
      .populate('items')
      .sort({ priority: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Donation.countDocuments(query);
    
    res.json({
      donations: pendingDonations,
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

// @route   PUT api/donations/:id/status
// @desc    Update donation status (Admin/Logistics)
// @access  Private/Admin
router.put(
  '/:id/status',
  [
    auth,
    roleAuth(['admin']),
    [check('status', 'Status is required').not().isEmpty()]
  ],
  async (req, res) => {
    try {
      const { status, notes, actualDelivery } = req.body;
      
      const donation = await Donation.findById(req.params.id)
        .populate('donor', 'name email')
        .populate('recipient', 'name email');
      
      if (!donation) {
        return res.status(404).json({ msg: 'Donation not found' });
      }
      
      const oldStatus = donation.status;
      donation.status = status;
      
      if (actualDelivery) {
        donation.actualDelivery = new Date(actualDelivery);
      }
      
      await donation.save();
      
      // Send appropriate notifications based on status change
      if (status === 'in-transit' && oldStatus !== 'in-transit') {
        await createNotification(
          donation.recipient,
          `Your donation is now in transit! Tracking ID: ${donation.trackingId}`,
          'donation_in_transit',
          donation._id,
          null,
          { priority: 'medium' }
        );
        
        await createNotification(
          donation.donor._id,
          `Your donation is now in transit to the recipient. Tracking ID: ${donation.trackingId}`,
          'donation_in_transit',
          donation._id,
          null,
          { priority: 'low' }
        );
      }
      
      if (status === 'delivered' && oldStatus !== 'delivered') {
        await createNotification(
          donation.recipient,
          `Your donation has been delivered! Please consider leaving feedback.`,
          'donation_delivered',
          donation._id,
          null,
          { priority: 'medium', actionUrl: `/donations/${donation._id}/feedback` }
        );
        
        await createNotification(
          donation.donor._id,
          `Great news! Your donation has been successfully delivered.`,
          'donation_delivered',
          donation._id,
          null,
          { priority: 'medium' }
        );
      }
      
      res.json({ donation, message: `Donation status updated to ${status}` });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/donations
// @desc    Get donations based on user role
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    let query = {};
    
    // Filter based on user role
    if (req.user.role === 'donor') {
      query.donor = req.user.id;
    } else if (req.user.role === 'recipient') {
      query.recipient = req.user.id;
    }
    // Admin can see all donations
    
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { trackingId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const donations = await Donation.find(query)
      .populate('donor', 'name email organization')
      .populate('recipient', 'name email organization')
      .populate('items')
      .populate('relatedRequest')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Donation.countDocuments(query);
    
    res.json({
      donations,
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

// @route   GET api/donations/:id
// @desc    Get donation by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone organization')
      .populate('recipient', 'name email phone organization')
      .populate('items')
      .populate('relatedRequest')
      .populate('logistics')
      .populate('approvedBy', 'name');
    
    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && 
        donation.donor.toString() !== req.user.id && 
        donation.recipient?.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(donation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;