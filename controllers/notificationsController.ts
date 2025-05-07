import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { clearAllMyNotifications, deleteNotification, getMyNotifications } from "../util/queries";

const getNotifications = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const allNotifications = await getMyNotifications(req.user.id);

    if (!allNotifications) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    res.status(200).json({notifications: allNotifications});
    return;
});

const removeNotification = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req); 

    const deletedNotification = await deleteNotification(req.user.id, formData.id);

    if (!deletedNotification) {
        res.status(400).json({message: "Notification Not Found."});
        return;
    };

    res.status(200).json();
    return;
});

const clearNotifications = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const deletedNotifications = await clearAllMyNotifications(req.user.id);

    if (!deletedNotifications) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    res.status(200).json();
    return;
});

export {
    getNotifications,
    removeNotification,
    clearNotifications,
};