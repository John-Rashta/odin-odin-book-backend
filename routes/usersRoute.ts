import { Router } from "express";
import { isAuth } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { validateDataQuery, validateOptionalCredentials, validateSearch, validateUserProfile, validateUUID } from "../util/validators";
import { validationErrorMiddleware } from "../middleware/validationErrorMiddleware";
import { multerErrorMiddleware } from "../middleware/multerErrorMiddleware";
import { getIconsInfo, getMyFeed, getMyFollowers, getMyFollows, getMyInfo, getUser, getUserPosts, getUsers, searchUsers, stopFollowing, updateMyself } from "../controllers/usersController";

const usersRoute = Router();

usersRoute.get(
    "/",
    validateDataQuery,
    validationErrorMiddleware,
    getUsers,
);

usersRoute.get(
    "/search",
    validateSearch,
    validateDataQuery,
    validationErrorMiddleware,
    searchUsers,
);

usersRoute.get(
    "/self",
    isAuth,
    getMyInfo,
);

usersRoute.get(
    "/self/followers",
    isAuth,
    validateDataQuery,
    validationErrorMiddleware,
    getMyFollowers,
);

usersRoute.get(
    "/self/follows",
    isAuth,
    validateDataQuery,
    validationErrorMiddleware,
    getMyFollows,
);

usersRoute.get(
    "/self/feed",
    isAuth,
    validateDataQuery,
    validationErrorMiddleware,
    getMyFeed,
);

usersRoute.get(
    "/icons",
    getIconsInfo,
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
    validateDataQuery,
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