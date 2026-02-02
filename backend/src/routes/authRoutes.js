const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { sendMail } = require('../utils/mailer');
const { adminNewSignupTemplate } = require('../utils/emailTemplates');
const { signupValidation, loginValidation } = require('../middleware/validation');

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.redirect(`${process.env.REACT_APP_API_URL}/dashboard?token=${token}&role=${req.user.role}`);
  }
);

// Regular signup
router.post('/signup', signupValidation, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Validate role - only allow student, teacher, admin
    const validRoles = ['student', 'teacher', 'admin'];
    let userRole = validRoles.includes(role) ? role : 'student';

    // Restrict admin role to specific email only
    if (userRole === 'admin') {
      if (email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ error: 'Only authorized email can create admin account' });
      }
    }

    user = new User({
      name,
      email,
      password,
      role: userRole
    });

    await user.save();

    // If user requires admin approval, do not issue token yet
    if (!user.isApproved) {
      // notify all admins by email, but only once per user
      try {
        if (!user.approvalNotified) {
          const admins = await User.find({ role: 'admin' }).select('email name');
          const adminEmails = admins.map(a => a.email).filter(Boolean);
          if (adminEmails.length) {
            const { subject, html } = adminNewSignupTemplate(user);
            await sendMail({ to: adminEmails.join(','), subject, html });
          }
          user.approvalNotified = true;
          await user.save();
        }
        // create in-app notification for admins
        try {
          const Notification = require('../models/Notification');
          await Notification.create({
            type: 'new_signup',
            message: `${user.name} signed up as ${user.role}` ,
            data: { userId: user._id, email: user.email, role: user.role }
          });
        } catch (nerr) {
          console.error('Failed to create admin notification:', nerr.message);
        }
      } catch (mailErr) {
        console.error('Failed to send admin notification email:', mailErr.message);
      }
      return res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved
        },
        message: 'Account created. Awaiting admin approval.'
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Regular login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Deny login if account not yet approved by admin
    if (user.isApproved === false) {
      return res.status(403).json({ error: 'Account awaiting admin approval' });
    }

    // Deny login if account disabled by admin
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account has been disabled' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
