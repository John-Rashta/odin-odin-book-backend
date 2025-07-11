import { validationResult } from "express-validator";
import { Request, Response, NextFunction, Handler } from "express";
import { deleteLocalFile } from "../util/helperFunctions";

const validationErrorMiddleware: Handler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      await deleteLocalFile(req.file);
    }
    const result = errors.formatWith((error) => error.msg).array();
    res.status(400).json({ message: result });
    return;
  }
  next();
};

export { validationErrorMiddleware };
