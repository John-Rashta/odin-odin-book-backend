import multer from "multer";
import path from "node:path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedFormats = [".jpeg", ".jpg", ".png", ".webp"];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedFormats.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid File Extension"));
    }
  },
});

export { upload };
