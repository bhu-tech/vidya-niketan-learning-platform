const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const User = require('../models/User');
const router = express.Router();

// Mark attendance when student joins class (after 5 minutes)
// Called from frontend when student joins live class
router.post('/mark/:classId', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const studentId = req.user.id;
    const { joinTime } = req.body;

    // Fetch class details
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Calculate class start time
    const classStartTime = new Date(classData.schedule.date);
    classStartTime.setHours(parseInt(classData.schedule.startTime.split(':')[0]));
    classStartTime.setMinutes(parseInt(classData.schedule.startTime.split(':')[1]));

    // Check if 5 minutes have passed since class started
    const joinTimeDate = new Date(joinTime);
    const timeDiffMinutes = (joinTimeDate - classStartTime) / (1000 * 60);

    if (timeDiffMinutes < 5) {
      return res.status(400).json({ error: 'Class not started yet or too early to mark attendance' });
    }

    // Get today's date (without time)
    const todayDate = new Date(classData.schedule.date);
    todayDate.setHours(0, 0, 0, 0);

    // Check if attendance already marked for today
    const existingAttendance = await Attendance.findOne({
      class: classId,
      student: studentId,
      date: {
        $gte: todayDate,
        $lt: new Date(todayDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Attendance already marked for today' });
    }

    // Create attendance record
    const attendance = new Attendance({
      class: classId,
      student: studentId,
      date: todayDate,
      joinTime: joinTimeDate,
      classStartTime: classStartTime,
      isPresent: true
    });

    await attendance.save();
    res.json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get attendance for a class (admin and teacher only)
router.get('/class/:classId', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;

    // Verify user is teacher or admin
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const isTeacher = classData.teacher._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all attendance records for this class with student details
    const attendance = await Attendance.find({ class: classId })
      .populate('student', 'name email phone')
      .sort({ date: -1, student: 1 });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get attendance summary for a class (with percentage)
router.get('/summary/:classId', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;

    // Verify user is teacher or admin
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const isTeacher = classData.teacher._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all students in this class
    const students = classData.students;

    // Get all attendance records for this class
    const attendanceRecords = await Attendance.find({ class: classId })
      .populate('student', 'name email phone');

    // Get all unique dates (class sessions)
    const uniqueDates = [...new Set(attendanceRecords.map(a => new Date(a.date).toDateString()))];
    const totalSessions = uniqueDates.length;

    // Calculate attendance for each student
    const attendanceSummary = students.map(student => {
      const studentAttendance = attendanceRecords.filter(
        a => a.student._id.toString() === student._id.toString()
      );
      const presentCount = studentAttendance.length;
      const percentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

      return {
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        studentPhone: student.phone,
        presentCount,
        totalSessions,
        attendancePercentage: Math.round(percentage * 100) / 100,
        attendanceDates: studentAttendance.map(a => ({
          date: a.date,
          joinTime: a.joinTime
        }))
      };
    });

    res.json({
      totalSessions,
      uniqueDates: uniqueDates.sort(),
      attendanceSummary: attendanceSummary.sort((a, b) => b.attendancePercentage - a.attendancePercentage)
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get attendance summary for a specific student in a class
router.get('/student/:classId/:studentId', authMiddleware, async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    // Verify user is teacher, admin, or the student
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const isTeacher = classData.teacher._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isStudent = req.user.id === studentId;

    if (!isTeacher && !isAdmin && !isStudent) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find({
      class: classId,
      student: studentId
    }).sort({ date: -1 });

    const student = await User.findById(studentId).select('name email phone');
    
    const totalSessions = await Attendance.distinct('date', { class: classId }).then(dates => dates.length);
    const presentCount = attendanceRecords.length;
    const percentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

    res.json({
      student,
      presentCount,
      totalSessions,
      attendancePercentage: Math.round(percentage * 100) / 100,
      attendanceRecords
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
