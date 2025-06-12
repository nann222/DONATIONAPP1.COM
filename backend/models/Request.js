const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
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
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'fulfilled', 'cancelled', 'partially_fulfilled'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  // Enhanced fields for workflow
  fulfilledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  relatedDonations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'donation'
  }],
  quantityFulfilled: {
    type: Number,
    default: 0
  },
  expectedDelivery: {
    type: Date
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contactInfo: {
    phone: String,
    email: String,
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'both'],
      default: 'email'
    }
  },
  specialInstructions: String,
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes
RequestSchema.index({ recipient: 1, status: 1 })
RequestSchema.index({ status: 1, urgency: 1, requestDate: -1 })
RequestSchema.index({ itemType: 1, status: 1 })
RequestSchema.index({ 'location.coordinates': '2dsphere' })

module.exports = mongoose.model('request', RequestSchema);