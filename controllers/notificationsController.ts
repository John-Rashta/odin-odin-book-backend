import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import {
  clearAllMyNotifications,
  removeNotification,
  getMyNotifications,
} from "../util/queries";

const getNotifications = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  }

  const allNotifications = await getMyNotifications(req.user.id);

  if (!allNotifications) {
    res.status(500).json({ message: "Internal Error" });
    return;
  }

  res.status(200).json({ notifications: allNotifications });
  return;
});

const clearNotification = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  }

  const formData = matchedData(req);

  const possibleUser = await removeNotification(req.user.id, formData.id);

  if (!possibleUser) {
    res.status(500).json({ message: "Internal Error" });
    return;
  }

  res.status(200).json();
  return;
});

const clearNotifications = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  }

  const possibleUser = await clearAllMyNotifications(req.user.id);

  if (!possibleUser) {
    res.status(500).json({ message: "Internal Error" });
    return;
  }

  res.status(200).json();
  return;
});

export { getNotifications, clearNotification, clearNotifications };
