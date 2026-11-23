/**
 * ImgBB Image Hosting Service
 * Uploads images securely through the backend to https://api.imgbb.com/1/upload
 * Keeps API key protected on the server side.
 */

/**
 * Upload a single file buffer to ImgBB
 * @param {Buffer} buffer - File buffer
 * @param {string} originalname - Original file name with extension
 * @param {string} mimeType - File mime type (e.g. image/png, image/jpeg)
 * @returns {Promise<{url: string, displayUrl: string, thumbUrl: string, id: string}>}
 */
async function uploadToImgBB(buffer, originalname = 'product.jpg', mimeType = 'image/jpeg') {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error('IMGBB_API_KEY is not configured in backend environment variables.');
  }

  const formData = new FormData();
  formData.append('key', apiKey);
  formData.append('image', new Blob([buffer], { type: mimeType }), originalname);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data || !data.success) {
    const errorMsg =
      data?.error?.message || `ImgBB upload failed with HTTP status ${response.status}`;
    console.error('❌ [ImgBB Upload Error]:', errorMsg, data);
    throw new Error(errorMsg);
  }

  // ImgBB returns direct image URL in data.url and display_url
  const imageUrl = data.data.url || data.data.display_url;

  return {
    url: imageUrl,
    displayUrl: data.data.display_url,
    thumbUrl: data.data.thumb?.url || null,
    deleteUrl: data.data.delete_url || null,
    id: data.data.id,
    title: data.data.title,
  };
}

/**
 * Upload multiple files to ImgBB concurrently
 * @param {Array<{buffer: Buffer, originalname: string, mimetype: string}>} files
 * @returns {Promise<Array<string>>} List of hosted image URLs
 */
async function uploadMultipleToImgBB(files) {
  if (!files || files.length === 0) {
    throw new Error('No image files provided for upload.');
  }

  const uploadPromises = files.map((file) =>
    uploadToImgBB(file.buffer, file.originalname, file.mimetype)
  );

  const results = await Promise.all(uploadPromises);
  return results;
}

module.exports = {
  uploadToImgBB,
  uploadMultipleToImgBB,
};
