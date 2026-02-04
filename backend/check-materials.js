const mongoose = require('mongoose');
const Material = require('./src/models/Material');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pdfsDir = path.join(__dirname, 'uploads', 'pdfs');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected');
  
  const materials = await Material.find({});
  console.log(`\nFound ${materials.length} materials in database:\n`);
  
  materials.forEach(material => {
    const fileName = path.basename(material.fileUrl);
    const filePath = path.join(pdfsDir, fileName);
    const exists = fs.existsSync(filePath);
    
    console.log(`Material ID: ${material._id}`);
    console.log(`  File Name: ${material.fileName}`);
    console.log(`  File URL: ${material.fileUrl}`);
    console.log(`  File Path: ${filePath}`);
    console.log(`  Exists: ${exists ? '✅ YES' : '❌ NO'}`);
    console.log(`  Class ID: ${material.classId}`);
    console.log('');
  });
  
  console.log('\nActual files in uploads/pdfs:');
  const files = fs.readdirSync(pdfsDir);
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
