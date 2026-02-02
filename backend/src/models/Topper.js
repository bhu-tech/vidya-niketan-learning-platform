const mongoose = require('mongoose');

const TopperSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true // Format: "YYYY-MM" e.g., "2026-02"
  },
  year: {
    type: Number,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  firstTopper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  secondTopper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  thirdTopper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  announcedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  announcement: {
    type: String,
    default: 'Congratulations to our toppers of the month!'
  }
}, {
  timestamps: true
});

// Index to ensure only one topper record per class per month
TopperSchema.index({ month: 1, year: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('Topper', TopperSchema);
