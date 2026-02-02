const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // Notification type: 'admin', 'teacher', 'system'
  type: { type: String, required: true, enum: ['admin', 'teacher', 'system'] },
  
  // Sender information
  sender: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    role: String
  },
  
  // Notification content
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Class-wise notification
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  
  // Recipients
  recipients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  
  // Read status for each student
  readBy: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      readAt: { type: Date, default: Date.now }
    }
  ],
  
  // Priority level
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  
  // Additional data
  data: { type: Object },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient querying
NotificationSchema.index({ class: 1, createdAt: -1 });
NotificationSchema.index({ 'recipients': 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
