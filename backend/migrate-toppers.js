const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const migrateToppers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB Connected');

    const db = mongoose.connection.db;
    
    // Drop the old unique index
    try {
      await db.collection('toppers').dropIndex('month_1_year_1');
      console.log('✅ Dropped old index: month_1_year_1');
    } catch (error) {
      console.log('ℹ️ Old index may not exist:', error.message);
    }

    // Delete all existing topper records (since they don't have classId)
    const result = await db.collection('toppers').deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} existing topper records`);

    // Create the new unique index
    await db.collection('toppers').createIndex(
      { month: 1, year: 1, classId: 1 },
      { unique: true }
    );
    console.log('✅ Created new index: month_1_year_1_classId_1');

    console.log('\n🎉 Migration completed successfully!');
    console.log('You can now run seed-toppers.js to create test data.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

migrateToppers();
