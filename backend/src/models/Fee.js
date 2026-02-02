const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  grade: {
    type: String,
    enum: ['IX', 'X', 'XI', 'XII'],
    required: true
  },
  fatherName: {
    type: String,
    default: ''
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  feeToBeDeposited: {
    type: Number,
    default: 0
  },
  feeSubmitted: {
    type: Number,
    default: 0
  },
  giftVoucherUsed: {
    type: Number,
    default: 0
  },
  referenceIncentive: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Fee', FeeSchema);
