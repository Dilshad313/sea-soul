const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Water Sports', 'Adventure', 'Cultural', 'Relaxation', 'Dining', 'Wildlife'],
    },
    duration: {
      type: String,
      default: '2 hours',
    },
    location: {
      type: String,
      default: '',
    },
    maxParticipants: {
      type: Number,
      default: 10,
    },
    includes: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', ActivitySchema);