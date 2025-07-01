import { Router } from "express";
import { validateCredentials } from "../util/validators";
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
    validateCredentials,
    validationErrorMiddleware,
    passport.authenticate(["local"]),
    loginUser,
);

authRoute.delete(
    "/",
    isAuth,
    logoutUser,
);

export default authRoute;