import { Router } from "express";
import { validateCommentQuery, validateLikeType, validatePost, validateUUID } from "../util/validators";
import { validationErrorMiddleware } from "../middleware/validationErrorMiddleware";
import { changeLike, createPost, deletePost, getMyPosts, getPost, postComment, updatePost } from "../controllers/postsController";
import { isAuth } from "../middleware/authMiddleware";
import { multerErrorMiddleware } from "../middleware/multerErrorMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const postsRoute = Router();

postsRoute.get(
    "/",
    isAuth,
    getMyPosts,
);

postsRoute.get(
    "/:id",
    isAuth,
    validateUUID("id"),
    validationErrorMiddleware,
    getPost,
);

postsRoute.put(
    "/:id",
    isAuth,
    validateUUID("id"),
    validatePost,
    validationErrorMiddleware,
    updatePost
);

postsRoute.put(
    "/:id/likes",
    isAuth,
    validateUUID("id"),
    validateLikeType,
    validationErrorMiddleware,
    changeLike,
);

postsRoute.post(
    "/",
    isAuth,
    upload.single("uploaded_file"),
    validatePost,
    validationErrorMiddleware,
    createPost,
    multerErrorMiddleware,
);

postsRoute.post(
    "/:id",
    isAuth,
    upload.single("uploaded_file"),
    validatePost,
    validateUUID("id"),
    validateCommentQuery,
    validationErrorMiddleware,
    postComment,
    multerErrorMiddleware,
);

postsRoute.delete(
    "/:id",
    isAuth,
    validateUUID("id"),
    validationErrorMiddleware,
    deletePost,
);







export default postsRoute;
