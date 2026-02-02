const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Class = require('../models/Class');
const router = express.Router();

// Create class (Teacher only)
router.post('/', authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
  try {
    const { title, description, schedule } = req.body;

    const newClass = new Class({
      title,
      description,
      teacher: req.user.id,
      schedule
    });

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

module.exports = router;
