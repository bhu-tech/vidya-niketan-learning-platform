const cron = require('node-cron');
const Class = require('../models/Class');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');
const { classReminderTemplate } = require('../utils/emailTemplates');

// Helper to get today's date string
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Helper to check if a class should run today
const shouldClassRunToday = (classData) => {
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { weekday: 'long' });

  if (!classData.schedule || !classData.isActive) return false;

  if (classData.schedule.frequency === 'once') {
    const classDate = new Date(classData.schedule.date);
    return classDate.toDateString() === now.toDateString();
  }

  if (classData.schedule.frequency === 'daily') {
    return true;
  }

  if (classData.schedule.frequency === 'custom' && classData.schedule.customDays?.includes(today)) {
    return true;
  }

  return false;
};

// Helper to check if notification was already sent today
const wasNotificationSentToday = (classData, notificationType) => {
  const todayDateString = getTodayDateString();
  
  return classData.notificationsSent?.some(notification => {
    const notificationDate = new Date(notification.date);
    const notificationDateString = notificationDate.toISOString().split('T')[0];
    return notificationDateString === todayDateString && notification.type === notificationType;
  });
};

// Send reminder emails
const sendClassReminder = async (classData, minutesBefore) => {
  try {
    const notificationType = `${minutesBefore}min`;

    // Check if notification already sent today
    if (wasNotificationSentToday(classData, notificationType)) {
      console.log(`${minutesBefore}min notification already sent for class: ${classData.title}`);
      return;
    }

    // Populate teacher and students
    await classData.populate('teacher students');

    // Send to teacher
    const teacherTemplate = classReminderTemplate(classData.teacher, classData, minutesBefore);
    await sendMail({
      to: classData.teacher.email,
      subject: teacherTemplate.subject,
      html: teacherTemplate.html
    });

    // Send to all enrolled students
    for (const student of classData.students) {
      const studentTemplate = classReminderTemplate(student, classData, minutesBefore);
      await sendMail({
        to: student.email,
        subject: studentTemplate.subject,
        html: studentTemplate.html
      });
    }

    // Mark notification as sent
    await Class.findByIdAndUpdate(classData._id, {
      $push: {
        notificationsSent: {
          date: new Date(),
          type: notificationType
        }
      }
    });

    console.log(`✅ Sent ${minutesBefore}min reminders for class: ${classData.title} to ${classData.students.length + 1} recipients`);
  } catch (error) {
    console.error(`Error sending ${minutesBefore}min reminder:`, error);
  }
};

// Check for upcoming classes and send notifications
const checkUpcomingClasses = async () => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Get all active classes
    const classes = await Class.find({ isActive: true })
      .populate('teacher')
      .populate('students');

    for (const classData of classes) {
      // Check if class should run today
      if (!shouldClassRunToday(classData)) {
        continue;
      }

      if (!classData.schedule.startTime) continue;

      // Parse class start time
      const [classHour, classMinute] = classData.schedule.startTime.split(':').map(Number);
      const classStartTime = new Date(now);
      classStartTime.setHours(classHour, classMinute, 0, 0);

      // Calculate time difference in minutes
      const timeDiff = Math.floor((classStartTime - now) / 1000 / 60);

      // Send 30-minute reminder (between 29 and 31 minutes before)
      if (timeDiff >= 29 && timeDiff <= 31) {
        await sendClassReminder(classData, 30);
      }

      // Send 15-minute reminder (between 14 and 16 minutes before)
      if (timeDiff >= 14 && timeDiff <= 16) {
        await sendClassReminder(classData, 15);
      }
    }
  } catch (error) {
    console.error('Error checking upcoming classes:', error);
  }
};

// Start the notification scheduler
const startNotificationScheduler = () => {
  // Run every minute to check for upcoming classes
  cron.schedule('* * * * *', () => {
    checkUpcomingClasses();
  });

  console.log('📧 Class notification scheduler started - checking every minute');
};

module.exports = { startNotificationScheduler };
