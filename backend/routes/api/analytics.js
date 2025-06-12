const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/roleAuth');
const Donation = require('../../models/Donation');
const Request = require('../../models/Request');
const Item = require('../../models/Item');
const User = require('../../models/User');
const Feedback = require('../../models/Feedback');

// @route   GET api/analytics/summary
// @desc    Get analytics summary
// @access  Private/Admin
router.get('/summary', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    // Total donations
    const totalDonations = await Donation.countDocuments();
    
    // Donations by status
    const donationsByStatus = await Donation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Total items donated
    const totalItems = await Item.countDocuments();
    
    // Items by type
    const itemsByType = await Item.aggregate([
      { $group: { _id: '$itemType', count: { $sum: 1 } } }
    ]);
    
    // Total users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Average feedback rating
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    
    res.json({
      totalDonations,
      donationsByStatus,
      totalItems,
      itemsByType,
      usersByRole,
      averageRating: avgRating.length > 0 ? avgRating[0].avg : 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/donations
// @desc    Get donation analytics
// @access  Private/Admin
router.get('/donations', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    // Donations over time
    const donationsOverTime = await Donation.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$donationDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(donationsOverTime);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;