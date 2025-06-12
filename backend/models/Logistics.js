const mongoose = require('mongoose');

const LogisticsSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'donation',
    required: true
  },
  pickupAddress: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  pickupDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['scheduled', 'picked-up', 'in-transit', 'delivered'],
    default: 'scheduled'
  },
  provider: {
    type: String,
    default: ''
  },
  driverName: {
    type: String,
    default: ''
  },
  driverPhone: {
    type: String,
    default: ''
  },
  vehicleInfo: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
LogisticsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = Logistics = mongoose.model('logistics', LogisticsSchema);