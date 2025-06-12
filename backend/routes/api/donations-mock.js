const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/roleAuth');
const { getMockUsers } = require('./users-mock');

// Mock data storage
let mockDonations = [];
let donationIdCounter = 1;
let itemIdCounter = 1;

// Helper function to get mock donations
const getMockDonations = () => mockDonations;

// @route   POST api/donations
// @desc    Create a donation
// @access  Private/Donor
router.post(
  '/',
  [
    auth,
    roleAuth(['donor']),
    [
      check('items', 'Items are required').isArray({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { items, description } = req.body;
      
      // Create mock items
      const mockItems = items.map(item => ({
        _id: `item_${itemIdCounter++}`,
        ...item,
        createdAt: new Date()
      }));
      
      // Create mock donation
      const newDonation = {
        _id: `donation_${donationIdCounter++}`,
        donor: req.user.id,
        items: mockItems,
        description,
        status: 'available',
        donationDate: new Date(),
        createdAt: new Date()
      };
      
      mockDonations.push(newDonation);
      
      // Populate donor info for response
      const mockUsers = getMockUsers();
      const donor = mockUsers.find(u => u._id === req.user.id);
      if (donor) {
        newDonation.donor = { _id: donor._id, name: donor.name };
      }
      
      res.json({
        donation: newDonation,
        potentialMatches: []
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/donations
// @desc    Get all donations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let donations;
    const mockUsers = getMockUsers();
    
    // Filter by role
    if (req.user.role === 'donor') {
      donations = mockDonations.filter(d => d.donor === req.user.id || d.donor._id === req.user.id);
    } else if (req.user.role === 'recipient') {
      donations = mockDonations.filter(d => d.recipient === req.user.id || (d.recipient && d.recipient._id === req.user.id));
    } else {
      // Admin can see all
      donations = [...mockDonations];
    }
    
    // Populate user info
    donations = donations.map(donation => {
      const donorInfo = mockUsers.find(u => u._id === donation.donor || u._id === donation.donor._id);
      const recipientInfo = donation.recipient ? mockUsers.find(u => u._id === donation.recipient || u._id === donation.recipient._id) : null;
      
      return {
        ...donation,
        donor: donorInfo ? { _id: donorInfo._id, name: donorInfo.name } : donation.donor,
        recipient: recipientInfo ? { _id: recipientInfo._id, name: recipientInfo.name, organization: recipientInfo.organization } : donation.recipient
      };
    });
    
    res.json(donations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
module.exports.getMockDonations = getMockDonations;