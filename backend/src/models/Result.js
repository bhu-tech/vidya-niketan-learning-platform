const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
  },
  remarks: {
    type: String,
    default: ''
  },
  examType: {
    type: String,
    enum: ['Mid-term', 'Final', 'Quiz', 'Assignment', 'Project', 'Other'],
    default: 'Other'
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate percentage and grade before saving
ResultSchema.pre('save', function(next) {
  this.percentage = ((this.marksObtained / this.maxMarks) * 100).toFixed(2);
  
  // Calculate grade
  const percent = parseFloat(this.percentage);
  if (percent >= 90) this.grade = 'A+';
  else if (percent >= 80) this.grade = 'A';
  else if (percent >= 70) this.grade = 'B+';
  else if (percent >= 60) this.grade = 'B';
  else if (percent >= 50) this.grade = 'C+';
  else if (percent >= 40) this.grade = 'C';
  else if (percent >= 33) this.grade = 'D';
  else this.grade = 'F';
  
  next();
});

// Index for efficient queries
ResultSchema.index({ student: 1, class: 1, subject: 1, examType: 1 });

module.exports = mongoose.model('Result', ResultSchema);
