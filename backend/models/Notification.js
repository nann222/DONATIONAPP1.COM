const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'donation_matched', 
      'donation_received', 
      'request_fulfilled', 
      'donation_submitted',
      'donation_response',
      'donation_approved',
      'donation_rejected',
      'donation_in_transit',
      'donation_delivered',
      'request_created',
      'request_updated',
      'system_update',
      'general'
    ],
    default: 'general'
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedDonation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'donation'
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'request'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: String,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 })
NotificationSchema.index({ type: 1, createdAt: -1 })
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('notification', NotificationSchema);