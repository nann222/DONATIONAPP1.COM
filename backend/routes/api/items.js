const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Item = require('../../models/Item');
const { check, validationResult } = require('express-validator');

// @route   POST api/items
// @desc    Create an item (e.g., for a donation listing)
// @access  Private (e.g., Donor)
router.post(
  '/',
  [auth, [
    check('itemName', 'Item name is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('quantity', 'Quantity is required and must be a number').isNumeric(),
  ]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemName, description, category, quantity, condition, image } = req.body;

    try {
      const newItem = new Item({
        itemName,
        description,
        category, // Should be an ObjectId referencing a Category model
        quantity,
        condition,
        image, // URL to the image
        // postedBy: req.user.id // If items are directly linked to users outside donations
      });

      const item = await newItem.save();
      res.json(item);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/items
// @desc    Get all items (potentially with filters, e.g., by category)
// @access  Public or Private (depending on use case)
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().populate('category', ['name']); // Example: populate category name
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/items/:id
// @desc    Get item by ID
// @access  Public or Private
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('category', ['name']);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/items/:id
// @desc    Update an item
// @access  Private (e.g., original poster or admin)
router.put('/:id', auth, async (req, res) => {
  const { itemName, description, category, quantity, condition, image } = req.body;
  const itemFields = {};
  if (itemName) itemFields.itemName = itemName;
  if (description) itemFields.description = description;
  if (category) itemFields.category = category;
  if (quantity) itemFields.quantity = quantity;
  if (condition) itemFields.condition = condition;
  if (image) itemFields.image = image;

  try {
    let item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    // Add authorization check if needed: e.g., if (item.postedBy.toString() !== req.user.id) ...

    item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: itemFields },
      { new: true }
    );
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/items/:id
// @desc    Delete an item
// @access  Private (e.g., original poster or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    // Add authorization check if needed

    await Item.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;