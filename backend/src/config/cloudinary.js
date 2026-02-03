const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for PDFs
const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vidya-niketan/pdfs',
    resource_type: 'raw', // For non-image files like PDFs
    allowed_formats: ['pdf'],
    public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`
  }
});

// Storage for thumbnails
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vidya-niketan/thumbnails',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 300, crop: 'fill' }],
    public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`
  }
});

module.exports = { cloudinary, pdfStorage, thumbnailStorage };
