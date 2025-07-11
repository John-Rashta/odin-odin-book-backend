import { Router } from "express";
import {
  validateCommentQuery,
  validateDataQuery,
  validateLikeType,
  validatePost,
  validateUpdateContent,
  validateUUID,
} from "../util/validators";
import { validationErrorMiddleware } from "../middleware/validationErrorMiddleware";
import {
  changeLike,
  createPost,
  deletePost,
  getMyPosts,
  getPost,
  getPostComments,
  postComment,
  updatePost,
} from "../controllers/postsController";
import { isAuth } from "../middleware/authMiddleware";
import { multerErrorMiddleware } from "../middleware/multerErrorMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const postsRoute = Router();

postsRoute.get(
  "/",
  isAuth,
  validateDataQuery,
  validationErrorMiddleware,
  getMyPosts,
);

postsRoute.get("/:id", validateUUID("id"), validationErrorMiddleware, getPost);

postsRoute.get(
  "/:id/comments",
  validateUUID("id"),
  validateDataQuery,
  validationErrorMiddleware,
  getPostComments,
);

postsRoute.put(
  "/:id",
  isAuth,
  validateUUID("id"),
  validateUpdateContent,
  validationErrorMiddleware,
  updatePost,
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
