const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
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

// Request join token (prevents duplicate joins)
router.post('/:id/request-join-token', authMiddleware, async (req, res) => {
  try {
    // Attendance model is already imported at the top
    const crypto = require('crypto');
    
    const classData = await Class.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', '_id');
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (!classData.isLive) {
      return res.status(400).json({ error: 'Class is not live' });
    }

    // Check if user is enrolled or is the teacher
    const isTeacher = classData.teacher._id.toString() === req.user.id;
    const isStudent = classData.students.some(s => s._id.toString() === req.user.id);

    // Teachers don't need tokens - they join directly as moderators
    if (isTeacher) {
      return res.status(400).json({ error: 'Teachers join directly as moderators without tokens' });
    }

    if (!isStudent) {
      return res.status(403).json({ error: 'You are not enrolled in this class' });
    }

    // For students - check if already in an active session
    if (isStudent) {
      const activeSession = await Attendance.findOne({
        class: req.params.id,
        student: req.user.id,
        activeSession: true,
        tokenExpiry: { $gt: new Date() }
      });

      if (activeSession) {
        return res.status(400).json({ 
          error: 'You already have an active session. Please close your existing meeting window first.' 
        });
      }
    }

    // Generate one-time token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Create or update attendance record
    if (isStudent) {
      await Attendance.findOneAndUpdate(
        {
          class: req.params.id,
          student: req.user.id,
          date: new Date().setHours(0, 0, 0, 0)
        },
        {
          joinTime: new Date(),
          classStartTime: classData.liveStartedAt,
          activeSession: true,
          joinToken: token,
          tokenExpiry: tokenExpiry
        },
        { upsert: true, new: true }
      );
    }

    res.json({ 
      token,
      expiresIn: 120 // seconds
    });
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

    // Determine if user is moderator (teacher)
    const isModerator = isTeacher;

    // For students, validate join token
    if (!isModerator) {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ error: 'Join token required' });
      }

      // Find and validate token
      const attendance = await Attendance.findOne({
        class: classData._id,
        student: req.user._id,
        joinToken: token
      });

      if (!attendance) {
        return res.status(403).json({ error: 'Invalid or expired join token' });
      }

      if (!attendance.tokenExpiry || attendance.tokenExpiry < Date.now()) {
        return res.status(403).json({ error: 'Join token has expired' });
      }

      // Consume the token (one-time use) and clear active session on successful join
      attendance.joinToken = null;
      attendance.tokenExpiry = null;
      // Note: activeSession will be cleared when student leaves the meeting
      await attendance.save();
    }

    const user = { name: req.user.name || 'User', email: req.user.email };
    const config = getJitsiEmbedConfig(classData.jitsiRoomName, user, classData.meetingPassword, isModerator);

    res.json({
      ...config,
      isLive: classData.isLive,
      meetingLink: classData.meetingLink,
      className: classData.title,
      teacherName: classData.teacher.name,
      isModerator
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End active session (when student leaves meeting)
router.post('/:id/end-session', authMiddleware, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Clear active session for this student
    await Attendance.findOneAndUpdate(
      {
        class: classData._id,
        student: req.user._id,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      },
      {
        activeSession: false,
        joinToken: null,
        tokenExpiry: null
      }
    );

    res.json({ success: true, message: 'Session ended' });
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
