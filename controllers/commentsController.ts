import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { changeCommentLike, deleteThisComment, getThisComment, updateThisComment } from "../util/queries";
import { deleteFiles } from "../util/helperFunctions";
import { getTakeAndSkip } from "../util/dataHelpers";

const updateComment = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    const updatedComment = await updateThisComment(req.user.id, formData.id, formData.content);

    const { _count, ...noCount } = updatedComment;
    const properComment = {...noCount, likes: _count.likes, ownCommentsCount: _count.ownComments};

    if (req.io) {
        req.io.to(`post:${updatedComment.postid}:comments`).emit("comment:updated",  {type: "comment", id: updatedComment.postid, comment: properComment})
    }

    res.status(200).json();
    return;
});

const deleteComment  = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    const deletedComment = await deleteThisComment(req.user.id, formData.id);

    if (deletedComment.image) {
        await deleteFiles([deletedComment.image]);
    }
    
    if (req.io) {
        req.io.to(`post:${deletedComment.postid}:comments`).emit("comment:deleted", {id: deletedComment.postid, commentid: deletedComment.id});
    }
    res.status(200).json();
    return;
});

const getComment = asyncHandler(async (req, res) => {
    const formData = matchedData(req);

    const foundComment = await getThisComment(formData.id, getTakeAndSkip({amount: formData.amount, skip: formData.skip}));

    if (!foundComment) {
        res.status(400).json({message: "Comment not found."});
        return;
    };

    const {_count, ownComments, ...rest} = foundComment;

    res.status(200).json({comment: {...rest, likes: _count.likes, 
        ownComments: ownComments.map(({_count, ...val}) => ({...val, likes: _count.likes, ownCommentsCount: _count.ownComments}))}});
    return;
});

const changeLike = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    const changedComment = await changeCommentLike(req.user.id, formData.id, formData.action === "ADD" && "connect" || "disconnect");

    if (req.io) {
        req.io.to(`post:${changedComment.postid}:comments`).emit("comment:updated", {type:"likes", id: changedComment.postid, likes: changedComment._count.likes});
    }
    res.status(200).json();
    return;
});


export {
    updateComment,
    deleteComment,
    getComment,
    changeLike,
};