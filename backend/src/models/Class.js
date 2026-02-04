const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  jitsiRoomName: String, // Unique room name for Jitsi
  meetingLink: String, // Full Jitsi meeting link
  meetingPassword: String, // Password for the meeting
  isLive: {
    type: Boolean,
    default: false
  },
  liveStartedAt: Date,
  schedule: {
    date: Date,
    startTime: String,
    endTime: String,
    frequency: {
      type: String,
      enum: ['once', 'daily', 'custom'],
      default: 'once'
    },
    customDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }]
  },
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  }],
  notificationsSent: [{
    date: Date,
    type: String, // '30min' or '15min'
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
