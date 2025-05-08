import { Router } from "express";
import { isAuth } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { validateOptionalCredentials, validateSearch, validateUserProfile, validateUUID } from "../util/validators";
import { validationErrorMiddleware } from "../middleware/validationErrorMiddleware";
import { multerErrorMiddleware } from "../middleware/multerErrorMiddleware";
import { getMyFeed, getMyFollowers, getMyFollows, getMyInfo, getMyPosts, getUser, getUserPosts, getUsers, stopFollowing, updateMyself } from "../controllers/usersController";

const usersRoute = Router();

usersRoute.get(
    "/",
    isAuth,
    validateSearch,
    validationErrorMiddleware,
    getUsers,
);

usersRoute.get(
    "/self",
    isAuth,
    getMyInfo,
);

usersRoute.get(
    "/self/followers",
    isAuth,
    getMyFollowers,
);

usersRoute.get(
    "/self/follows",
    isAuth,
    getMyFollows,
);

usersRoute.get(
    "/self/posts",
    isAuth,
    getMyPosts,
);

usersRoute.get(
    "/self/feed",
    isAuth,
    getMyFeed,
);

usersRoute.get(
    "/:id",
    validateUUID("id"),
    validationErrorMiddleware,
    getUser,
);

usersRoute.get(
    "/:id/posts",
    validateUUID("id"),
    validationErrorMiddleware,
    getUserPosts,
);

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

usersRoute.delete(
    "/:id/follow",
    isAuth,
    validateUUID("id"),
    validationErrorMiddleware,
    stopFollowing,
);

export default usersRoute;