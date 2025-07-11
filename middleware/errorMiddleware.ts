import { ErrorRequestHandler } from "express";
import { deleteLocalFile } from "../util/helperFunctions";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = async (err, req, res, next) => {
  console.error(err);
  if (req.file) {
    await deleteLocalFile(req.file);
  }
  res.status(500).json({ message: "Internal Error" });
  return;
};

export { errorHandler };
