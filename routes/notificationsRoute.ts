import { Router } from "express";
import { validateUUID } from "../util/validators";
import { validationErrorMiddleware } from "../middleware/validationErrorMiddleware";
import { isAuth } from "../middleware/authMiddleware";
import { getNotifications, clearNotification, clearNotifications } from "../controllers/notificationsController";

const notificationsRoute = Router();

notificationsRoute.get(
    "/",
    isAuth,
    getNotifications,
);

notificationsRoute.delete(
    "/",
    isAuth,
    clearNotifications,
);

notificationsRoute.delete(
    "/:id",
    isAuth,
    validateUUID("id"),
    validationErrorMiddleware,
    clearNotification,
);

export default notificationsRoute;
