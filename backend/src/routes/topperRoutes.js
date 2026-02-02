const express = require('express');
const router = express.Router();
const Topper = require('../models/Topper');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// @route   GET /api/toppers/class/:classId
// @desc    Get current month's toppers for a specific class
// @access  Public (all authenticated users)
router.get('/class/:classId', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const topper = await Topper.findOne({ month, classId })
      .populate('firstTopper', 'name email profilePicture')
      .populate('secondTopper', 'name email profilePicture')
      .populate('thirdTopper', 'name email profilePicture')
      .populate('announcedBy', 'name');

    res.json(topper || null);
  } catch (error) {
    console.error('Error fetching current toppers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/toppers/all
// @desc    Get all toppers history
// @access  Public (all authenticated users)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const toppers = await Topper.find()
      .sort({ year: -1, month: -1 })
      .populate('firstTopper', 'name email profilePicture')
      .populate('secondTopper', 'name email profilePicture')
      .populate('thirdTopper', 'name email profilePicture')
      .populate('announcedBy', 'name')
      .limit(12); // Last 12 months

    res.json(toppers);
  } catch (error) {
    console.error('Error fetching toppers history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/toppers
// @desc    Create/Update toppers for current month for a specific class
// @access  Teacher/Admin only
router.post('/', authMiddleware, roleMiddleware(['teacher', 'admin']), async (req, res) => {
  try {
    const { classId, firstTopper, secondTopper, thirdTopper, announcement } = req.body;

    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }

    if (!firstTopper) {
      return res.status(400).json({ message: 'First topper is required' });
    }

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const year = now.getFullYear();

    // Check if toppers already exist for this class and month
    let topper = await Topper.findOne({ month, classId });

    if (topper) {
      // Update existing record
      topper.firstTopper = firstTopper;
      topper.secondTopper = secondTopper || null;
      topper.thirdTopper = thirdTopper || null;
      topper.announcement = announcement || 'Congratulations to our toppers of the month!';
      topper.announcedBy = req.user.id;
      await topper.save();
    } else {
      // Create new record
      topper = await Topper.create({
        month,
        year,
        classId,
        firstTopper,
        secondTopper: secondTopper || null,
        thirdTopper: thirdTopper || null,
        announcement: announcement || 'Congratulations to our toppers of the month!',
        announcedBy: req.user.id
      });
    }

    // Populate and return
    await topper.populate('firstTopper', 'name email profilePicture');
    await topper.populate('secondTopper', 'name email profilePicture');
    await topper.populate('thirdTopper', 'name email profilePicture');
    await topper.populate('announcedBy', 'name');

    res.json(topper);
  } catch (error) {
    console.error('Error creating/updating toppers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/toppers/:month
// @desc    Delete toppers for a specific month
// @access  Admin only
router.delete('/:month', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { month } = req.params;
    
    const topper = await Topper.findOneAndDelete({ month });
    
    if (!topper) {
      return res.status(404).json({ message: 'Toppers not found for this month' });
    }

    res.json({ message: 'Toppers deleted successfully' });
  } catch (error) {
    console.error('Error deleting toppers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
