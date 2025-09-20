const dayjs = require('dayjs');
const cloudinary = require('../utils/cloudinary');

exports.fileUpload = async function (files, folder) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!Array.isArray(files)) {
        return reject("Expected an array of files.");
      }

      const uploadedFileUrls = [];

      for (let file of files) {
        // Get the MIME type from base64
        const mime_type = file.split(';')[0].split(":")[1].split('/')[1];

        if (!["png", "jpeg", "jpg", "mp4", "pdf", "webp"].includes(mime_type)) {
          return reject("File formats allowed: png, jpeg, jpg, mp4, pdf, webp");
        }

        const file_name = dayjs().format("YYYYMMDDHHmmss") + Math.floor(Math.random() * 100);

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file, {
          folder: folder,
          public_id: file_name,
          resource_type: mime_type === 'mp4' ? 'video' : 'image', // handle videos
        });

        uploadedFileUrls.push(result.secure_url); // store the URL
      }

      resolve(uploadedFileUrls);

    } catch (error) {
      console.error("Upload error:", error);
      reject(error.message || error);
    }
  });
};
