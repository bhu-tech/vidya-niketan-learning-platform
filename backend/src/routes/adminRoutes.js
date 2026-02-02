const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Class = require('../models/Class');
const router = express.Router();
const { sendMail } = require('../utils/mailer');
const { userApprovedTemplate } = require('../utils/emailTemplates');
const Notification = require('../models/Notification');

// Get dashboard stats
router.get('/stats', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalClasses = await Class.countDocuments();

    res.json({
      totalUsers,
      totalTeachers,
      totalStudents,
      totalClasses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending user approvals
router.get('/users/pending', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const pending = await User.find({ isApproved: false }).select('name email role createdAt');
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve a user
router.put('/users/:id/approve', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    // send approval notification to user (best effort)
    try {
      const { subject, html } = userApprovedTemplate(user);
      await sendMail({ to: user.email, subject, html });
    } catch (mailErr) {
      console.error('Failed to send approval email:', mailErr.message);
    }

    res.json({ message: 'User approved', user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk approve users
router.put('/users/approve-batch', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No user ids provided' });

    const result = await User.updateMany({ _id: { $in: ids } }, { $set: { isApproved: true } });
    // send approval emails to approved users (best effort)
    try {
      const approvedUsers = await User.find({ _id: { $in: ids } });
      for (const u of approvedUsers) {
        try {
          const { subject, html } = userApprovedTemplate(u);
          await sendMail({ to: u.email, subject, html });
        } catch (e) {
          console.error('Failed to send approval email to', u.email, e.message);
        }
      }
    } catch (e) {
      console.error('Failed to fetch approved users for email:', e.message);
    }

    res.json({ message: 'Users approved', matched: result.matchedCount || result.n, modified: result.modifiedCount || result.nModified });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin notifications
router.get('/notifications', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const notes = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification read
router.put('/notifications/:id/read', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const note = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!note) return res.status(404).json({ error: 'Notification not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle user active state
router.put('/users/:id/active', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { active } = req.body; // boolean
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: !!active }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User active state updated', user: { id: user._id, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all classes
router.get('/classes', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('teacher', 'name email')
      .populate('students', 'name email');
    
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
