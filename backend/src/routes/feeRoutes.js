const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const Fee = require('../models/Fee');
const User = require('../models/User');
const router = express.Router();

// Get fee details by grade
router.get('/grade/:grade', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { grade } = req.params;
    
    const fees = await Fee.find({ grade })
      .populate('student', 'name email phone')
      .sort({ dateOfJoining: -1 });

    res.json(fees);
  } catch (error) {
    console.error('Error fetching fee details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get fee details by student ID
router.get('/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user._id || req.user.id;

    // Students can only view their own fee details
    if (req.user.role === 'student' && studentId !== userId.toString() && studentId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const fees = await Fee.find({ student: studentId })
      .populate('student', 'name email phone')
      .sort({ dateOfJoining: -1 });

    res.json(fees);
  } catch (error) {
    console.error('Error fetching student fee details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update fee record
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { studentId, grade, fatherName, dateOfJoining, feeToBeDeposited, feeSubmitted, giftVoucherUsed, referenceIncentive } = req.body;

    let fee = await Fee.findOne({ student: studentId, grade });

    if (fee) {
      // Update existing
      fee.fatherName = fatherName || fee.fatherName;
      fee.dateOfJoining = dateOfJoining || fee.dateOfJoining;
      fee.feeToBeDeposited = feeToBeDeposited !== undefined ? feeToBeDeposited : fee.feeToBeDeposited;
      fee.feeSubmitted = feeSubmitted !== undefined ? feeSubmitted : fee.feeSubmitted;
      fee.giftVoucherUsed = giftVoucherUsed !== undefined ? giftVoucherUsed : fee.giftVoucherUsed;
      fee.referenceIncentive = referenceIncentive !== undefined ? referenceIncentive : fee.referenceIncentive;
      await fee.save();
    } else {
      // Create new
      fee = new Fee({
        student: studentId,
        grade,
        fatherName,
        dateOfJoining,
        feeToBeDeposited,
        feeSubmitted,
        giftVoucherUsed,
        referenceIncentive
      });
      await fee.save();
    }

    const populatedFee = await Fee.findById(fee._id).populate('student', 'name email phone');
    res.json(populatedFee);
  } catch (error) {
    console.error('Error creating/updating fee:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete fee record
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fee record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
