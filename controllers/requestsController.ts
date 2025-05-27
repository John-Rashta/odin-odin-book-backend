import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { createFollowship, createNotification, deleteThisRequest, getFollowshipForCheck, getUserReceivedRequests, getUserSentRequests, makeRequest } from "../util/queries";

const getReceivedRequests = asyncHandler( async(req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const receivedRequests = await getUserReceivedRequests(req.user.id);

    if (!receivedRequests) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    res.status(200).json({received: receivedRequests});
    return;
});

const getSentRequests = asyncHandler( async(req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const sentRequests = await getUserSentRequests(req.user.id);

    if (!sentRequests) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    res.status(200).json({sent: sentRequests});
    return;
});

const deleteRequest = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    const deletedRequest = await deleteThisRequest(req.user.id, formData.id);

    if (!deletedRequest) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    if (req.io) {
        if (req.user.id === deletedRequest.senderid) {
            req.io.to(`self:${deletedRequest.targetid}`).emit("request", {action: "REMOVE", data: {id: deletedRequest.id, userid: deletedRequest.senderid}});
        } else if (req.user.id === deletedRequest.targetid) {
            req.io.to(`self:${deletedRequest.senderid}`).emit("request", {action: "REMOVE", data: {id: deletedRequest.id, userid: deletedRequest.targetid}});
        }
    };

    res.status(200).json();
    return;
});

const acceptRequest = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    const acceptedRequest = await deleteThisRequest(req.user.id, formData.id, "targetid");

    if (!acceptedRequest) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    const targetUser = await createFollowship(acceptedRequest.senderid, req.user.id);

    if (!targetUser) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    const createdNotification = await createNotification(
        {
            createdAt: new Date(),
            content: `${req.user.username} accepted your Follow Request`,
            type: "USER",
            typeid: acceptedRequest.senderid,
            usersid: [acceptedRequest.senderid]
        }
    );

    if (createdNotification && req.io) {
        const { _count } = targetUser;
        req.io.to(`self:${acceptedRequest.senderid}`).emit("notification", {notification: createdNotification});
        req.io.to(`user:${acceptedRequest.targetid}`).emit("user:updated", {type: "followers", newCount: _count.followers, id: acceptedRequest.targetid});
    };

    res.status(200).json();
    return;
});

const createRequest = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    if (req.user.id === formData.id) {
        res.status(400).json();
        return;
    };

    const checkUser = await getFollowshipForCheck(req.user.id, formData.id);
    if (checkUser) {
        res.status(400).json();
        return;
    };

    const createdRequest = await makeRequest({
        targetid: formData.id,
        senderid: req.user.id,
        sentAt: new Date(),
        type: formData.type
    });

    if (!createdRequest) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    const createdNotification = await createNotification({
        createdAt: createdRequest.sentAt,
        usersid: [createdRequest.targetid],
        type: "USER",
        typeid: req.user.id,
        content: `${req.user.username} sent you a ${formData.type.toLowerCase()} request`
    });

    if (createdNotification && req.io) {
        req.io.to(`self:${createdRequest.targetid}`).emit("notification", {notification: createdNotification});
        req.io.to(`self:${createdRequest.targetid}`).emit("request", {action: "ADD", data: {request: createdRequest}});
    };

    res.status(200).json();
    return;
});

export {
    getReceivedRequests,
    getSentRequests,
    deleteRequest,
    acceptRequest,
    createRequest,
};