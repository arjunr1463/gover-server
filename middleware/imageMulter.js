const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../cloudinary/cloudinaryConfig");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profileImage",
    format: async (req, file) => "jpg",
    public_id: (req, file) => file.originalname,
  },
});

const multerParser = multer({ storage: storage });

module.exports = { multerParser };
