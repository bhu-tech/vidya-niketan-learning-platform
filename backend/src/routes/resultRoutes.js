const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Class = require('../models/Class');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { resultValidation, mongoIdValidation } = require('../middleware/validation');

// @route   POST /api/results
// @desc    Create/Update result for a student
// @access  Teacher/Admin only
router.post('/', authMiddleware, roleMiddleware(['teacher', 'admin']), resultValidation, async (req, res) => {
  try {
    const { student, classId, subject, marksObtained, maxMarks, examType, remarks } = req.body;

    if (!student || !classId || !subject || marksObtained === undefined || !maxMarks) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (marksObtained < 0 || marksObtained > maxMarks) {
      return res.status(400).json({ message: 'Invalid marks. Marks obtained cannot be negative or exceed max marks' });
    }

    // Check if result already exists for this combination
    let result = await Result.findOne({ 
      student, 
      class: classId, 
      subject, 
      examType: examType || 'Other' 
    });

    if (result) {
      // Update existing result
      result.marksObtained = marksObtained;
      result.maxMarks = maxMarks;
      result.remarks = remarks || '';
      result.publishedBy = req.user.id;
      await result.save();
    } else {
      // Create new result
      result = await Result.create({
        student,
        class: classId,
        subject,
        marksObtained,
        maxMarks,
        examType: examType || 'Other',
        remarks: remarks || '',
        publishedBy: req.user.id
      });
    }

    // Populate and return
    await result.populate('student', 'name email');
    await result.populate('class', 'title');
    await result.populate('publishedBy', 'name');

    res.json(result);
  } catch (error) {
    console.error('Error creating/updating result:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/results/class/:classId
// @desc    Get all results for a class
// @access  Teacher/Admin only
router.get('/class/:classId', authMiddleware, roleMiddleware(['teacher', 'admin']), async (req, res) => {
  try {
    const { classId } = req.params;

    const results = await Result.find({ class: classId })
      .populate('student', 'name email')
      .populate('class', 'title')
      .populate('publishedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    console.error('Error fetching class results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/results/student/:studentId
// @desc    Get all results for a student
// @access  Student (own), Teacher, Admin
router.get('/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Students can only view their own results
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const results = await Result.find({ student: studentId, isPublished: true })
      .populate('class', 'title')
      .populate('publishedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/results/my-results
// @desc    Get logged-in student's results
// @access  Student only
router.get('/my-results', authMiddleware, roleMiddleware(['student']), async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id, isPublished: true })
      .populate('class', 'title')
      .populate('publishedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    console.error('Error fetching my results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/results/all
// @desc    Get all results (Admin only)
// @access  Admin only
router.get('/all', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const results = await Result.find()
      .populate('student', 'name email')
      .populate('class', 'title')
      .populate('publishedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    console.error('Error fetching all results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/results/:resultId
// @desc    Delete a result
// @access  Teacher/Admin only
router.delete('/:resultId', authMiddleware, roleMiddleware(['teacher', 'admin']), async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await Result.findByIdAndDelete(resultId);

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Error deleting result:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
