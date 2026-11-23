const express = require('express');
const multer = require('multer');
const { uploadImages } = require('../controllers/upload.controller');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Memory storage keeps file buffers in memory for direct ImgBB streaming
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
    files: 10, // Max 10 images at once
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP, GIF, AVIF) are allowed'), false);
    }
  },
});

// Multer middleware supporting both 'images' array and single 'image'
const uploadMiddleware = (req, res, next) => {
  const handler = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'image', maxCount: 1 },
  ]);

  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'One or more image files exceed the 10MB size limit.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Flatten req.files into req.files array for the controller
    const allFiles = [];
    if (req.files) {
      if (req.files.images) allFiles.push(...req.files.images);
      if (req.files.image) allFiles.push(...req.files.image);
    }
    req.files = allFiles;

    next();
  });
};

// Route: POST /api/upload
router.post('/', protect, admin, uploadMiddleware, uploadImages);

module.exports = router;
