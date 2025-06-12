const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/roleAuth');
const Logistics = require('../../models/Logistics');
const Donation = require('../../models/Donation');

// @route   GET api/logistics
// @desc    Get all logistics entries
// @access  Private/Admin
router.get('/', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const logistics = await Logistics.find()
      .populate({
        path: 'donation',
        populate: {
          path: 'items donor recipient',
          select: 'itemName itemType quantity name email'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(logistics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/logistics/:id
// @desc    Get logistics by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const logistics = await Logistics.findById(req.params.id)
      .populate({
        path: 'donation',
        populate: {
          path: 'items donor recipient',
          select: 'itemName itemType quantity name email'
        }
      });
    
    if (!logistics) {
      return res.status(404).json({ msg: 'Logistics entry not found' });
    }
    
    res.json(logistics);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Logistics entry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/logistics
// @desc    Create logistics entry
// @access  Private/Admin
router.post(
  '/',
  [
    auth,
    roleAuth(['admin']),
    [
      check('donation', 'Donation ID is required').not().isEmpty(),
      check('pickupAddress', 'Pickup address is required').not().isEmpty(),
      check('deliveryAddress', 'Delivery address is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        donation,
        pickupAddress,
        deliveryAddress,
        pickupDate,
        deliveryDate,
        status,
        provider,
        driverName,
        driverPhone,
        vehicleInfo,
        notes
      } = req.body;

      // Check if donation exists
      const donationExists = await Donation.findById(donation);
      if (!donationExists) {
        return res.status(404).json({ msg: 'Donation not found' });
      }

      // Check if logistics already exists for this donation
      const existingLogistics = await Logistics.findOne({ donation });
      if (existingLogistics) {
        return res.status(400).json({ msg: 'Logistics already exists for this donation' });
      }

      const newLogistics = new Logistics({
        donation,
        pickupAddress,
        deliveryAddress,
        pickupDate: pickupDate || new Date(),
        deliveryDate: deliveryDate || new Date(),
        status: status || 'scheduled',
        provider,
        driverName,
        driverPhone,
        vehicleInfo,
        notes
      });

      const logistics = await newLogistics.save();
      
      // Update donation with logistics reference
      await Donation.findByIdAndUpdate(donation, { logistics: logistics._id });

      // Populate the response
      const populatedLogistics = await Logistics.findById(logistics._id)
        .populate({
          path: 'donation',
          populate: {
            path: 'items donor recipient',
            select: 'itemName itemType quantity name email'
          }
        });

      res.json(populatedLogistics);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/logistics/:id
// @desc    Update logistics entry
// @access  Private/Admin
router.put('/:id', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const {
      pickupAddress,
      deliveryAddress,
      pickupDate,
      deliveryDate,
      status,
      provider,
      driverName,
      driverPhone,
      vehicleInfo,
      notes
    } = req.body;

    // Build logistics object
    const logisticsFields = {};
    if (pickupAddress) logisticsFields.pickupAddress = pickupAddress;
    if (deliveryAddress) logisticsFields.deliveryAddress = deliveryAddress;
    if (pickupDate) logisticsFields.pickupDate = pickupDate;
    if (deliveryDate) logisticsFields.deliveryDate = deliveryDate;
    if (status) logisticsFields.status = status;
    if (provider !== undefined) logisticsFields.provider = provider;
    if (driverName !== undefined) logisticsFields.driverName = driverName;
    if (driverPhone !== undefined) logisticsFields.driverPhone = driverPhone;
    if (vehicleInfo !== undefined) logisticsFields.vehicleInfo = vehicleInfo;
    if (notes !== undefined) logisticsFields.notes = notes;

    let logistics = await Logistics.findById(req.params.id);
    
    if (!logistics) {
      return res.status(404).json({ msg: 'Logistics entry not found' });
    }

    logistics = await Logistics.findByIdAndUpdate(
      req.params.id,
      { $set: logisticsFields },
      { new: true }
    ).populate({
      path: 'donation',
      populate: {
        path: 'items donor recipient',
        select: 'itemName itemType quantity name email'
      }
    });

    res.json(logistics);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Logistics entry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/logistics/:id
// @desc    Delete logistics entry
// @access  Private/Admin
router.delete('/:id', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const logistics = await Logistics.findById(req.params.id);
    
    if (!logistics) {
      return res.status(404).json({ msg: 'Logistics entry not found' });
    }

    // Remove logistics reference from donation
    await Donation.findByIdAndUpdate(logistics.donation, { $unset: { logistics: 1 } });
    
    await Logistics.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Logistics entry removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Logistics entry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/logistics/donation/:donationId
// @desc    Get logistics by donation ID
// @access  Private
router.get('/donation/:donationId', auth, async (req, res) => {
  try {
    const logistics = await Logistics.findOne({ donation: req.params.donationId })
      .populate({
        path: 'donation',
        populate: {
          path: 'items donor recipient',
          select: 'itemName itemType quantity name email'
        }
      });
    
    if (!logistics) {
      return res.status(404).json({ msg: 'Logistics entry not found for this donation' });
    }
    
    res.json(logistics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;