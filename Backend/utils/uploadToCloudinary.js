const cloudinary = require("./cloudinary");

const uploadToCloudinary = ({ buffer, subFolder, resourceType = "raw" }) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `wave/${subFolder}`,
          resource_type: resourceType, // image | video | raw
          disable_promises: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      )
      .end(buffer);
  });
};

module.exports = uploadToCloudinary;
