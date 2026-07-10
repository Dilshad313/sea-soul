const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// More permissive file filter for web compatibility
const fileFilter = (req, file, cb) => {
  console.log('📤 File mimetype:', file.mimetype);
  console.log('📤 File originalname:', file.originalname);
  
  // Allow all image types
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 
    'image/gif', 'image/webp', 'image/bmp',
    'image/svg+xml', 'image/tiff', 'image/x-icon'
  ];
  
  // Also accept if it contains 'image' in mimetype
  const isImage = file.mimetype && file.mimetype.startsWith('image/');
  
  if (isImage || allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed. Received: ' + file.mimetype), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;