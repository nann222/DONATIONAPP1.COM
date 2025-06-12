const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  expiryDate: {
    type: Date
  },
  description: {
    type: String
  },
  condition: {
    type: String,
    enum: ['new', 'good', 'fair', 'poor'],
    default: 'good'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('item', ItemSchema);