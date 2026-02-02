const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    joinTime: {
      type: Date,
      required: true
    },
    classStartTime: {
      type: Date,
      required: true
    },
    isPresent: {
      type: Boolean,
      default: false
    },
    markedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound index to ensure one attendance record per student per class per date
AttendanceSchema.index({ class: 1, student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
