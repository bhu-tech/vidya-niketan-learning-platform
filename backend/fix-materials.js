const mongoose = require('mongoose');
const Material = require('./src/models/Material');
const Class = require('./src/models/Class');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pdfsDir = path.join(__dirname, 'uploads', 'pdfs');
const thumbnailsDir = path.join(__dirname, 'uploads', 'thumbnails');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected\n');
  
  // Step 1: Remove orphaned database records (files don't exist)
  console.log('Step 1: Removing orphaned database records...');
  const materials = await Material.find({});
  
  for (const material of materials) {
    const fileName = path.basename(material.fileUrl);
    const filePath = path.join(pdfsDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`  ❌ Deleting orphaned record: ${material.fileName} (file not found)`);
      await Material.findByIdAndDelete(material._id);
    } else {
      console.log(`  ✅ Keeping: ${material.fileName}`);
    }
  }
  
  console.log('\n✅ Cleanup complete!\n');
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
