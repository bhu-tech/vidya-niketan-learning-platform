const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Import models
const User = require('./src/models/User');
const Topper = require('./src/models/Topper');
const Class = require('./src/models/Class');

const seedToppers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB Connected');

    // Get all students
    let students = await User.find({ role: 'student' });
    
    console.log(`📊 Found ${students.length} existing student(s)`);

    // Create additional students if needed
    if (students.length < 3) {
      console.log(`📝 Creating ${3 - students.length} additional test student(s)...`);
      
      const testStudents = [];
      const existingEmails = students.map(s => s.email);
      
      const studentData = [
        { name: 'Arjun Kumar', email: 'arjun.kumar@example.com' },
        { name: 'Priya Sharma', email: 'priya.sharma@example.com' },
        { name: 'Rahul Verma', email: 'rahul.verma@example.com' }
      ];

      for (const data of studentData) {
        if (!existingEmails.includes(data.email) && testStudents.length + students.length < 3) {
          const hashedPassword = await bcrypt.hash('password123', 10);
          const student = await User.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: 'student',
            isApproved: true
          });
          testStudents.push(student);
          console.log(`   ✅ Created student: ${data.name}`);
        }
      }
      
      students = [...students, ...testStudents];
    }

    if (students.length < 1) {
      console.log('❌ Need at least 1 student in the database');
      process.exit(1);
    }

    // Get a teacher to announce
    const teacher = await User.findOne({ role: 'teacher' });
    
    if (!teacher) {
      console.log('❌ Need at least 1 teacher in the database');
      process.exit(1);
    }

    // Get first class
    const firstClass = await Class.findOne();
    
    if (!firstClass) {
      console.log('❌ Need at least 1 class in the database');
      process.exit(1);
    }

    // Current month and year
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const year = now.getFullYear();

    // Delete existing topper for current month and class if any
    await Topper.deleteOne({ month, classId: firstClass._id });

    // Create topper record
    const topper = await Topper.create({
      month,
      year,
      classId: firstClass._id,
      firstTopper: students[0]._id,
      secondTopper: students.length > 1 ? students[1]._id : null,
      thirdTopper: students.length > 2 ? students[2]._id : null,
      announcedBy: teacher._id,
      announcement: '🎉 Congratulations to our brilliant toppers of the month! Your hard work and dedication are truly inspiring. Keep up the excellent work! 🌟'
    });

    console.log('\n🏆 Toppers announced successfully!');
    console.log('=====================================');
    console.log(`📚 Class: ${firstClass.title}`);
    console.log(`🥇 First Topper: ${students[0].name} (${students[0].email})`);
    if (students.length > 1) {
      console.log(`🥈 Second Topper: ${students[1].name} (${students[1].email})`);
    }
    if (students.length > 2) {
      console.log(`🥉 Third Topper: ${students[2].name} (${students[2].email})`);
    }
    console.log(`📢 Announced by: ${teacher.name}`);
    console.log(`📅 Month: ${month}`);
    console.log('=====================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding toppers:', error);
    process.exit(1);
  }
};

seedToppers();
