const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/roleAuth');

// Predefined categories
const categories = [
  { id: 'food', name: 'Food', description: 'Non-perishable food items' },
  { id: 'clothes', name: 'Clothes', description: 'All types of clothing' },
  { id: 'books', name: 'Books', description: 'Books, textbooks, and educational materials' },
  { id: 'medicine', name: 'Medicine', description: 'Over-the-counter medications and medical supplies' },
  { id: 'other', name: 'Other', description: 'Miscellaneous items' }
];

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', (req, res) => {
  res.json(categories);
});

module.exports = router;