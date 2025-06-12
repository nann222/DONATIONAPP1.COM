const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'donation',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comments: {
    type: String
  },
  feedbackType: {
    type: String,
    enum: ['donor', 'recipient'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('feedback', FeedbackSchema);