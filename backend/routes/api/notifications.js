const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/roleAuth');
const Notification = require('../../models/Notification');

// @route   GET api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, read, type, priority } = req.query;
    
    const query = { recipient: req.user.id };
    if (read !== undefined) query.read = read === 'true';
    if (type) query.type = type;
    if (priority) query.priority = priority;
    
    const notifications = await Notification.find(query)
      .populate('relatedDonation', 'trackingId status')
      .populate('relatedRequest', 'itemType status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      read: false 
    });
    
    res.json({
      notifications,
      unreadCount,
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

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    
    // Check ownership
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/notifications/count
// @desc    Get unread notification count
// @access  Private
router.get('/count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/notifications
// @desc    Create a notification (Admin only)
// @access  Private/Admin
router.post('/', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const { recipientId, message, type, relatedDonation, relatedRequest, priority, actionRequired, actionUrl } = req.body;
    
    const notification = new Notification({
      recipient: recipientId,
      message,
      type,
      relatedDonation,
      relatedRequest,
      priority: priority || 'medium',
      actionRequired: actionRequired || false,
      actionUrl
    });
    
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;