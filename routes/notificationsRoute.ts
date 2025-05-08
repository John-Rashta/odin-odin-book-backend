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

notificationsRoute.put(
    "/:id",
    isAuth,
    validateUUID("id"),
    validationErrorMiddleware,
    clearNotification,
);

notificationsRoute.delete(
    "/",
    isAuth,
    clearNotifications,
)

export default notificationsRoute;
