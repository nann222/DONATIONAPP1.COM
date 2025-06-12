const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/roleAuth');
const {
  findMatchesForDonation,
  findMatchesForRequest,
  approveMatch,
  autoMatchDonations
} = require('../../services/matchingService');
const Donation = require('../../models/Donation');
const Request = require('../../models/Request');
const Notification = require('../../models/Notification');

// @route   GET api/matching/donation/:id
// @desc    Find matches for a donation
// @access  Private/Admin
router.get('/donation/:id', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const matches = await findMatchesForDonation(req.params.id);
    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (err) {
    console.error('Matching error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error finding matches',
      error: err.message
    });
  }
});

// @route   GET api/matching/request/:id
// @desc    Find matches for a request
// @access  Private
router.get('/request/:id', auth, async (req, res) => {
  try {
    const matches = await findMatchesForRequest(req.params.id);
    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (err) {
    console.error('Matching error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error finding matches',
      error: err.message
    });
  }
});

// @route   POST api/matching/approve
// @desc    Approve a donation-request match
// @access  Private/Admin
router.post('/approve', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const { donationId, requestId } = req.body;
    
    if (!donationId || !requestId) {
      return res.status(400).json({
        success: false,
        message: 'Donation ID and Request ID are required'
      });
    }
    
    const result = await approveMatch(donationId, requestId, false);
    
    res.json({
      success: true,
      message: 'Match approved successfully',
      data: result
    });
  } catch (err) {
    console.error('Match approval error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error approving match',
      error: err.message
    });
  }
});

// @route   POST api/matching/auto-match
// @desc    Run automatic matching for all pending donations
// @access  Private/Admin
router.post('/auto-match', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const autoMatches = await autoMatchDonations();
    
    res.json({
      success: true,
      message: `Auto-matching completed. ${autoMatches.length} matches created.`,
      data: autoMatches
    });
  } catch (err) {
    console.error('Auto-matching error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error in auto-matching',
      error: err.message
    });
  }
});

module.exports = router;