const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const { profileUpdateValidation, mongoIdValidation } = require('../middleware/validation');
const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledClasses');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, profileUpdateValidation, async (req, res) => {
  try {
    const { name, bio, phone, designation, profilePicture } = req.body;
    
    console.log('📝 Updating user profile:', { name, phone, designation });
    if (profilePicture) {
      console.log('📸 Profile picture size:', Math.round(profilePicture.length / 1024), 'KB');
    }
    
    const updateData = { name, bio, phone, designation };
    
    // Only include profilePicture if it's provided and not the same as existing
    if (profilePicture) {
      updateData.profilePicture = profilePicture;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    console.log('✅ Profile updated successfully for user:', user._id);
    res.json(user);
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// Enroll in class
router.post('/enroll/:classId', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;
    const Class = require('../models/Class');

    // Check if student is already enrolled
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if student already enrolled (handle both string and ObjectId comparisons)
    const alreadyEnrolled = classData.students.some(studentId => {
      const sid = studentId.toString ? studentId.toString() : studentId;
      return sid === userId;
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ error: 'You are already enrolled in this class' });
    }

    // Add class to user's enrolledClasses
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { enrolledClasses: classId } },
      { new: true }
    );

    // Add user to class's students array
    await Class.findByIdAndUpdate(
      classId,
      { $push: { students: userId } },
      { new: true }
    );

    console.log(`Student ${userId} enrolled in class ${classId}`);
    res.json(user);
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all students
router.get('/students', authMiddleware, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
