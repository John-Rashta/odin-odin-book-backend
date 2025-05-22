import { Router } from "express";
import { isAuth } from "../middleware/authMiddleware";
import { validateDataQuery, validateLikeType, validateUpdateContent, validateUUID } from "../util/validators";
import { validationErrorMiddleware } from "../middleware/validationErrorMiddleware";
import { changeLike, deleteComment, getComment, getComments, updateComment } from "../controllers/commentsController";


const commentsRoute = Router();

commentsRoute.delete(
    "/:id",
    isAuth,
    validateUUID("id"),
    validationErrorMiddleware,
    deleteComment,
);

commentsRoute.put(
    "/:id",
    isAuth,
    validateUUID("id"),
    validateUpdateContent,
    validationErrorMiddleware,
    updateComment,
);

commentsRoute.put(
    "/:id/likes",
    isAuth,
    validateUUID("id"),
    validateLikeType,
    validationErrorMiddleware,
    changeLike,
);

commentsRoute.get(
    "/:id",
    validateUUID("id"),
    validationErrorMiddleware,
    getComment,
);

commentsRoute.get(
    "/:id/comments",
    validateUUID("id"),
    validateDataQuery,
    validationErrorMiddleware,
    getComments,
);

export default commentsRoute;