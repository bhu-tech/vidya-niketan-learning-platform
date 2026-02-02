const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Notification = require('../models/Notification');
const Class = require('../models/Class');
const User = require('../models/User');

// Create notification (Admin/Teacher only)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, message, classId, priority } = req.body;
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    // Validate input
    if (!title || !message || !classId) {
      return res.status(400).json({ error: 'Title, message, and classId are required' });
    }

    // Check if user is admin or teacher
    if (userRole === 'student') {
      return res.status(403).json({ error: 'Only admin and teacher can send notifications' });
    }

    // Get class details
    const classData = await Class.findById(classId).populate('students');
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    // For teacher, verify they own this class
    if (userRole === 'teacher') {
      if (!classData.teacher) {
        return res.status(400).json({ error: 'Class has no teacher assigned' });
      }
      const teacherId = classData.teacher._id ? classData.teacher._id.toString() : classData.teacher.toString();
      if (teacherId !== userId.toString()) {
        return res.status(403).json({ error: 'You can only send notifications to your own classes' });
      }
    }

    // Get all students in the class
    const studentIds = classData.students.map(s => s._id || s);

    // Create notification
    const notification = new Notification({
      type: userRole === 'admin' ? 'admin' : 'teacher',
      title,
      message,
      class: classId,
      sender: {
        id: userId,
        name: req.user.name || req.user.email,
        role: userRole
      },
      recipients: studentIds,
      priority: priority || 'medium',
      createdAt: new Date()
    });

    await notification.save();

    res.status(201).json({
      success: true,
      notification: notification,
      message: 'Notification sent successfully to all class students'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Get notifications for a class (last 5) - For students
router.get('/class/:classId/latest', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user._id || req.user.id;

    // Verify student is enrolled in this class
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const isEnrolled = classData.students.some(s => s.toString() === userId.toString());
    if (!isEnrolled && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Not enrolled in this class' });
    }

    // Get last 5 notifications for this class
    const notifications = await Notification.find({ class: classId })
      .populate('sender.id', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-readBy');

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get all notifications for a class - For teachers/admins
router.get('/class/:classId', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    // Get class details
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check authorization
    if (userRole === 'teacher') {
      const teacherId = classData.teacher?._id || classData.teacher;
      if (!teacherId || teacherId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this class notifications' });
      }
    }

    if (userRole === 'student') {
      return res.status(403).json({ error: 'Students can only view latest notifications' });
    }

    // Get all notifications for this class
    const notifications = await Notification.find({ class: classId })
      .populate('sender.id', 'name email')
      .populate('recipients', 'name email')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get dashboard notifications for admin/teacher (MUST BE BEFORE /:notificationId)
router.get('/dashboard/all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    let query = {};
    
    if (userRole === 'admin') {
      // Admin sees all notifications they created
      query = { 'sender.id': userId, type: 'admin' };
    } else if (userRole === 'teacher') {
      // Teacher sees notifications they created
      query = { 'sender.id': userId, type: 'teacher' };
    } else {
      return res.status(403).json({ error: 'Only admin and teacher can access this' });
    }

    const notifications = await Notification.find(query)
      .populate('class', 'title')
      .populate('recipients', 'name email')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching dashboard notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id || req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check if student is in recipients
    const isRecipient = notification.recipients.some(r => r.toString() === userId.toString());
    if (!isRecipient) {
      return res.status(403).json({ error: 'Not a recipient of this notification' });
    }

    // Check if already read
    const alreadyRead = notification.readBy.some(r => r.student.toString() === userId.toString());
    if (!alreadyRead) {
      notification.readBy.push({
        student: userId,
        readAt: new Date()
      });
      await notification.save();
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Delete notification (admin/teacher only)
router.delete('/:notificationId', authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    if (userRole === 'student') {
      return res.status(403).json({ error: 'Only admin and teacher can delete notifications' });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check authorization
    if (userRole === 'teacher' && notification.sender.id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You can only delete your own notifications' });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
