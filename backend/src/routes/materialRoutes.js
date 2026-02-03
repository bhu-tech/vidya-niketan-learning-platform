const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Material = require('../models/Material');
const Class = require('../models/Class');
const { pdfStorage, thumbnailStorage, cloudinary } = require('../config/cloudinary');
const router = express.Router();

// Configure multer with Cloudinary storage
const upload = multer({
  storage: multer.diskStorage({}), // Temporary storage before Cloudinary
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file' && file.mimetype === 'application/pdf') {
      cb(null, true);
    } else if (file.fieldname === 'thumbnail' && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. PDF files only for materials, images only for thumbnails.'));
    }
  }
});

// Upload material
router.post('/upload/:classId', authMiddleware, roleMiddleware(['teacher', 'admin']), upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfFile = req.files.file[0];
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

    // Upload PDF to Cloudinary
    const pdfUpload = await cloudinary.uploader.upload(pdfFile.path, {
      folder: 'vidya-niketan/pdfs',
      resource_type: 'raw',
      public_id: `${Date.now()}-${pdfFile.originalname.replace(/\.[^/.]+$/, '')}`
    });

    // Upload thumbnail to Cloudinary (if provided)
    let thumbnailUpload = null;
    if (thumbnailFile) {
      thumbnailUpload = await cloudinary.uploader.upload(thumbnailFile.path, {
        folder: 'vidya-niketan/thumbnails',
        resource_type: 'image',
        transformation: [{ width: 400, height: 300, crop: 'fill' }],
        public_id: `${Date.now()}-${thumbnailFile.originalname.replace(/\.[^/.]+$/, '')}`
      });
    }

    const material = new Material({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'notes',
      fileUrl: pdfUpload.secure_url,
      fileName: pdfFile.originalname,
      fileSize: pdfFile.size,
      fileType: pdfFile.mimetype,
      thumbnailUrl: thumbnailUpload ? thumbnailUpload.secure_url : null,
      classId: req.params.classId,
      uploadedBy: req.user.id
    });

    await material.save();

    // Add material to class
    await Class.findByIdAndUpdate(
      req.params.classId,
      { $push: { materials: material._id } }
    );

    res.status(201).json(material);
  } catch (error) {
    console.error('Material upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get materials for a class
router.get('/class/:classId', authMiddleware, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.classId);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if user is authorized to view materials
    // Get user ID from JWT (could be 'id' or '_id')
    const userId = req.user.id || req.user._id;
    const userIdString = userId.toString ? userId.toString() : userId;
    
    // Get teacher ID and convert to string for comparison
    const teacherId = classData.teacher._id || classData.teacher;
    const teacherIdString = teacherId.toString ? teacherId.toString() : teacherId;
    const isTeacher = teacherIdString === userIdString;
    
    // Check if student is enrolled - handle both ObjectId and string comparisons, and populated objects
    const isStudent = classData.students.some(student => {
      // Handle case where student is a full user object (populated)
      const studentId = student._id || student;
      const studentIdString = studentId.toString ? studentId.toString() : studentId;
      return studentIdString === userIdString;
    });
    
    const isAdmin = req.user.role === 'admin';

    console.log('Material Authorization Check:', {
      userId: userIdString,
      teacherId: teacherIdString,
      isTeacher,
      studentIds: classData.students.map(s => {
        const id = s._id || s;
        return id.toString ? id.toString() : id;
      }),
      isStudent,
      userRole: req.user.role,
      isAdmin,
      authorized: isTeacher || isStudent || isAdmin
    });

    if (!isTeacher && !isStudent && !isAdmin) {
      return res.status(403).json({ error: 'Access denied. You must be enrolled in this class to view materials.' });
    }

    const materials = await Material.find({ classId: req.params.classId })
      .populate('uploadedBy', 'name email');
    
    res.json(materials);
  } catch (error) {
    console.error('Materials fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// View material - accessible to all authorized users (teachers, admins, and enrolled students)
router.get('/view/:id', authMiddleware, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Get the class to check authorization
    const classData = await Class.findById(material.classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check authorization (same as getByClass)
    const userId = req.user.id || req.user._id;
    const userIdString = userId.toString ? userId.toString() : userId;
    
    const teacherId = classData.teacher._id || classData.teacher;
    const teacherIdString = teacherId.toString ? teacherId.toString() : teacherId;
    const isTeacher = teacherIdString === userIdString;
    
    const isStudent = classData.students.some(student => {
      const studentId = student._id || student;
      const studentIdString = studentId.toString ? studentId.toString() : studentId;
      return studentIdString === userIdString;
    });
    
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isStudent && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // For Cloudinary URLs, redirect to the secure URL
    if (material.fileUrl.startsWith('http')) {
      return res.redirect(material.fileUrl);
    }

    // Legacy: For old local file paths (if any remain)
    const filePath = path.join(pdfsDir, path.basename(material.fileUrl));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=' + material.fileName);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download material - restricted to teachers and admins
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Only teachers and admins can download
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Students cannot download materials' });
    }

    // For Cloudinary URLs, redirect with download flag
    if (material.fileUrl.startsWith('http')) {
      // Add download flag to Cloudinary URL
      const downloadUrl = material.fileUrl.replace('/upload/', '/upload/fl_attachment/');
      return res.redirect(downloadUrl);
    }

    // Legacy: For old local file paths
    const filePath = path.join(pdfsDir, path.basename(material.fileUrl));
    res.download(filePath, material.fileName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete material
router.delete('/:id', authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
