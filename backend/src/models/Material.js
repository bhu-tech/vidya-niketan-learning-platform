const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  fileUrl: {
    type: String,
    required: true
  },
  fileName: String,
  fileSize: Number,
  fileType: String,
  thumbnailUrl: {
    type: String,
    default: null
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Material', MaterialSchema);
