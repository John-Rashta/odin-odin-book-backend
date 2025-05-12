import { Router } from "express";
import { isAuth } from "../middleware/authMiddleware";
import { validateUpdateContent, validateUUID } from "../util/validators";
import { validationErrorMiddleware } from "../middleware/validationErrorMiddleware";
import { changeLike, deleteComment, getComment, updateComment } from "../controllers/commentsController";


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
    validationErrorMiddleware,
    changeLike,
);

commentsRoute.get(
    "/:id",
    isAuth,
    validateUUID("id"),
    validationErrorMiddleware,
    getComment,
);

export default commentsRoute;