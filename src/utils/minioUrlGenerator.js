// utils/minioUrlGenerator.js
const minioClient = require('./minioClient');

const generatePresignedUrls = async (bucket, paths, expirySeconds = 7 * 24 * 60 * 60) => {  // 7 days default
  const urls = [];
  for (const path of paths) {
    try {
      const url = await minioClient.presignedUrl('GET', bucket, path, expirySeconds);
      urls.push(url);
    } catch (err) {
      console.error(`Failed to generate URL for ${path}:`, err);
      urls.push(null);  // Fallback; replace with throw if you want strict error handling
    }
  }
  return urls;
};

module.exports = { generatePresignedUrls };