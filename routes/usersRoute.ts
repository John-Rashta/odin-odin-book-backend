import { Router } from "express";
import { isAuth } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { validateOptionalCredentials, validateUserProfile } from "../util/validators";
import { validationErrorMiddleware } from "../middleware/validationErrorMiddleware";
import { multerErrorMiddleware } from "../middleware/multerErrorMiddleware";
import { updateMyself } from "../controllers/usersController";

const usersRoute = Router();

usersRoute.put(
    "/self",
    isAuth,
    upload.single("uploaded_file"),
    validateUserProfile,
    validateOptionalCredentials,
    validationErrorMiddleware,
    updateMyself,
    multerErrorMiddleware,
);

export default usersRoute;