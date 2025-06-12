const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'item'
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingId: {
    type: String,
    unique: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  logistics: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'logistics'
  },
  donationDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  },
  // New fields for enhanced workflow
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'request'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  approvalDate: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
})

// Add indexes for better query performance
DonationSchema.index({ donor: 1, status: 1 })
DonationSchema.index({ recipient: 1, status: 1 })
DonationSchema.index({ status: 1, createdAt: -1 })
DonationSchema.index({ trackingId: 1 })
DonationSchema.index({ relatedRequest: 1 })

// Generate unique tracking ID before saving
DonationSchema.pre('save', function(next) {
  if (!this.trackingId) {
    this.trackingId = 'SDMS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('donation', DonationSchema);