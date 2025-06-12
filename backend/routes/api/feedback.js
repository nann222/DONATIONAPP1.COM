const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Feedback = require('../../models/Feedback');
const Donation = require('../../models/Donation');

// @route   POST api/feedback
// @desc    Create feedback
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('donation', 'Donation ID is required').not().isEmpty(),
      check('rating', 'Rating is required and must be between 1-5').isInt({ min: 1, max: 5 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { donation, rating, comments } = req.body;
      
      // Check if donation exists
      const donationData = await Donation.findById(donation);
      if (!donationData) {
        return res.status(404).json({ msg: 'Donation not found' });
      }
      
      // Determine feedback type based on user role
      let feedbackType;
      if (req.user.id === donationData.donor.toString()) {
        feedbackType = 'donor';
      } else if (donationData.recipient && req.user.id === donationData.recipient.toString()) {
        feedbackType = 'recipient';
      } else {
        return res.status(403).json({ msg: 'Not authorized to provide feedback for this donation' });
      }
      
      // Check if user already provided feedback
      const existingFeedback = await Feedback.findOne({
        user: req.user.id,
        donation
      });
      
      if (existingFeedback) {
        return res.status(400).json({ msg: 'Feedback already provided' });
      }
      
      // Create feedback
      const newFeedback = new Feedback({
        user: req.user.id,
        donation,
        rating,
        comments,
        feedbackType
      });
      
      await newFeedback.save();
      
      res.json(newFeedback);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Donation not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/feedback
// @desc    Get all feedback
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const feedback = await Feedback.find()
      .populate('user', 'name')
      .populate('donation');
      
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;