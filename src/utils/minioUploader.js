// utils/minioUploader.js
const minioClient = require('./minioClient');
const path = require('path');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

const uploadFiles = async (bucket, files, item_code, version) => {
  // Ensure bucket exists
  try {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) await minioClient.makeBucket(bucket, 'us-east-1');  // Specify region for consistency
  } catch (err) {
    // Ignore if bucket exists or throw for other errors
    if (!/BucketAlreadyExists/.test(err.message || '')) throw err;
  }

  const uploadedPaths = [];  // Changed: Store short object paths, not long URLs

  for (const file of files) {
    if (!file.originalname) throw new Error('File missing originalname');

    // Create object name: items/<item_code>/v<version>/<timestamp>_<origname>
    const filename = `${Date.now()}_${file.originalname
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '')}`;  // Sanitize filename more thoroughly
    const objectName = `items/${item_code}/v${version}/${filename}`;

    try {
      const metadata = { 'Content-Type': file.mimetype || 'application/octet-stream' };

      if (file.buffer) {
        await minioClient.putObject(bucket, objectName, file.buffer, file.size || file.buffer.length, metadata);
      } else if (file.stream) {
        // Use putStream for better stream handling
        const putStream = minioClient.putStream(bucket, objectName, metadata);
        await pipeline(file.stream, putStream);
      } else {
        throw new Error('File must have buffer or stream');
      }

      // Push short object path (e.g., "items/ABC123/v1/173..._image.jpg") – avoids long URL length issues
      uploadedPaths.push(objectName);
    } catch (uploadErr) {
      console.error(`Upload failed for ${file.originalname}:`, uploadErr);
      throw uploadErr;  // Re-throw to fail the operation
    }
  }

  return uploadedPaths;  // Returns array of paths
};

module.exports = {
  uploadFiles
};
