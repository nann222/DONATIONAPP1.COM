const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Donation = require('../../models/Donation');
const Logistics = require('../../models/Logistics');

// @route   GET api/tracking/:trackingId
// @desc    Track donation by tracking ID
// @access  Public
router.get('/:trackingId', async (req, res) => {
  try {
    const donation = await Donation.findOne({ trackingId: req.params.trackingId })
      .populate('donor', 'name')
      .populate('recipient', 'name')
      .populate('logistics');
      
    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    
    res.json(donation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tracking/:id
// @desc    Update donation status
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'in-transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    
    // Check permissions
    if (
      req.user.role !== 'admin' &&
      donation.donor.toString() !== req.user.id &&
      (donation.recipient && donation.recipient.toString() !== req.user.id)
    ) {
      return res.status(403).json({ msg: 'Not authorized to update this donation' });
    }
    
    donation.status = status;
    await donation.save();
    
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