const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Class = require('../models/Class');
const { classValidation, mongoIdValidation } = require('../middleware/validation');
const { createJitsiMeeting, getJitsiEmbedConfig } = require('../utils/jitsi');
const router = express.Router();

// Create class (Teacher only)
router.post('/', authMiddleware, roleMiddleware(['teacher']), classValidation, async (req, res) => {
  try {
    const { title, description, schedule } = req.body;

    const newClass = new Class({
      title,
      description,
      teacher: req.user.id,
      schedule
    });

    // Create Jitsi meeting for this class
    const jitsiConfig = createJitsiMeeting(newClass);
    newClass.jitsiRoomName = jitsiConfig.jitsiRoomName;
    newClass.meetingLink = jitsiConfig.meetingLink;
    newClass.meetingPassword = jitsiConfig.meetingPassword;

    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all classes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher', 'name email').populate('students');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get class by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('teacher')
      .populate('students')
      .populate('materials');
    
    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update class
router.put('/:id', authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete class
router.delete('/:id', authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start live class (Teacher only)
router.post('/:id/start-live', authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classData.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    classData.isLive = true;
    classData.liveStartedAt = new Date();
    await classData.save();

    res.json({
      message: 'Class is now live',
      jitsiRoomName: classData.jitsiRoomName,
      meetingLink: classData.meetingLink,
      isLive: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End live class (Teacher only)
router.post('/:id/end-live', authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classData.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    classData.isLive = false;
    await classData.save();

    res.json({ message: 'Class ended', isLive: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Jitsi configuration for joining (Students & Teachers)
router.get('/:id/jitsi-config', authMiddleware, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', '_id');
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if user is enrolled or is the teacher
    const isTeacher = classData.teacher._id.toString() === req.user.id;
    const isStudent = classData.students.some(s => s._id.toString() === req.user.id);

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ error: 'You are not enrolled in this class' });
    }

    const user = { name: req.user.name || 'User', email: req.user.email };
    const config = getJitsiEmbedConfig(classData.jitsiRoomName, user, classData.meetingPassword);

    res.json({
      ...config,
      isLive: classData.isLive,
      meetingLink: classData.meetingLink,
      className: classData.title,
      teacherName: classData.teacher.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if class is live
router.get('/:id/live-status', authMiddleware, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).select('isLive liveStartedAt title');
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({
      isLive: classData.isLive,
      liveStartedAt: classData.liveStartedAt,
      title: classData.title
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
