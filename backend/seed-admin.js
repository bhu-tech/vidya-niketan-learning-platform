const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB connected');

    const adminEmail = process.env.ADMIN_EMAIL || 'vidyaniketanfoundation2025@gmail.com';
    
    // Check if admin exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`✅ Admin user already exists: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Is Approved: ${admin.isApproved}`);
      console.log(`   Is Active: ${admin.isActive}`);
    } else {
      // Create admin user
      admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: 'admin@123', // Change this!
        role: 'admin',
        isApproved: true,
        isActive: true
      });

      await admin.save();
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: admin@123 (CHANGE THIS IMMEDIATELY!)`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Is Approved: ${admin.isApproved}`);
      console.log(`   Is Active: ${admin.isActive}`);
    }

    // Ensure admin is approved and active
    if (!admin.isApproved || !admin.isActive) {
      admin.isApproved = true;
      admin.isActive = true;
      await admin.save();
      console.log(`✅ Updated admin account to be approved and active`);
    }

    console.log(`\n📝 You can now login with:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: admin@123`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

seedAdmin();
