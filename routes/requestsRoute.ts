import { Router } from "express";
import { isAuth } from "../middleware/authMiddleware";
import { validateRequest, validateUUID } from "../util/validators";
import { validationErrorMiddleware } from "../middleware/validationErrorMiddleware";
import { acceptRequest, createRequest, deleteRequest, getReceivedRequests, getSentRequests } from "../controllers/requestsController";

const requestsRoute = Router();

requestsRoute.get(
    "/",
    isAuth,
    getReceivedRequests,
);

requestsRoute.get(
    "/sent",
    isAuth,
    getSentRequests,
);

requestsRoute.post(
    "/",
    isAuth,
    validateRequest,
    validationErrorMiddleware,
    createRequest,
)

requestsRoute.put(
    "/:id",
    isAuth,
    validateUUID("id"),
    validationErrorMiddleware,
    acceptRequest,
);

requestsRoute.delete(
    "/:id",
    isAuth,
    validateUUID("id"),
    validationErrorMiddleware,
    deleteRequest,
);

export default requestsRoute;