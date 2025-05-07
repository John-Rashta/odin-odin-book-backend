import { Router } from "express";
import { validateUUID } from "../util/validators";
import { validationErrorMiddleware } from "../middleware/validationErrorMiddleware";
import { isAuth } from "../middleware/authMiddleware";
import { getNotifications, removeNotification, clearNotifications } from "../controllers/notificationsController";

const notificationsRoute = Router();

notificationsRoute.get(
    "/",
    isAuth,
    getNotifications,
);

notificationsRoute.put(
    "/:id",
    isAuth,
    validateUUID("id"),
    validationErrorMiddleware,
    removeNotification,
);

notificationsRoute.delete(
    "/",
    isAuth,
    clearNotifications,
)

export default notificationsRoute;
