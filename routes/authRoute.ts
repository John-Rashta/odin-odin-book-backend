import { Router } from "express";
import { validateCredentials, validateOptionalLogin } from "../util/validators";
import { validationErrorMiddleware } from "../middleware/validationErrorMiddleware";
import { isAuth } from "../middleware/authMiddleware";
import passport from "passport";
import { signupUser, loginUser, logoutUser } from "../controllers/authController";

const authRoute = Router();

authRoute.post(
    "/",
    validateCredentials,
    validationErrorMiddleware,
    signupUser
);

authRoute.put(
    "/",
    validateOptionalLogin,
    validationErrorMiddleware,
    passport.authenticate(["local", "anonymous"]),
    loginUser,
);

authRoute.delete(
    "/",
    isAuth,
    logoutUser,
);

export default authRoute;