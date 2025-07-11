import { ErrorRequestHandler } from "express";
import { MulterError } from "multer";

const multerErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof MulterError) {
    res.status(400).json({ message: "Upload Error: " + err.message });
    return;
  } else if (err.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({ message: "File Size Limit Is 5MB" });
    return;
  } else {
    next(err);
    return;
  }
};

export { multerErrorMiddleware };
