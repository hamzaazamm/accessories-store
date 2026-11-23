const { uploadToImgBB, uploadMultipleToImgBB } = require('../services/imgbb.service');

/**
 * @desc    Upload product images to ImgBB
 * @route   POST /api/upload
 * @access  Private/Admin
 */
const uploadImages = async (req, res, next) => {
  try {
    let files = [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      files = req.files;
    } else if (req.file) {
      files = [req.file];
    }

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided. Please select at least one image to upload.',
      });
    }

    // Validate mime types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    for (const file of files) {
      if (!allowedMimes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Unsupported file type "${file.mimetype}". Allowed types: JPG, PNG, WEBP, GIF, AVIF.`,
        });
      }
    }

    const uploadResults = await uploadMultipleToImgBB(files);
    const urls = uploadResults.map((item) => item.url);

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${urls.length} image(s) to ImgBB.`,
      count: urls.length,
      urls,
      images: uploadResults,
    });
  } catch (error) {
    console.error('❌ [Upload Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Image upload failed. Please try again.',
    });
  }
};

module.exports = {
  uploadImages,
};
