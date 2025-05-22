import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { changeCommentLike, deleteThisComment, getThisComment, getThisCommentComments, updateThisComment } from "../util/queries";
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
    const properComment = {...noCount, likesCount: _count.likes, ownCommentsCount: _count.ownComments};

    if (req.io) {
        req.io.to(`post:${updatedComment.postid}:comments`).emit("comment:updated",  {type: "comment", id: updatedComment.postid, comment: properComment})
    }

    res.status(200).json({comment: properComment});
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

    const foundComment = await getThisComment(formData.id, req.user?.id);

    if (!foundComment) {
        res.status(400).json({message: "Comment not found."});
        return;
    };

    const {_count, ...rest} = foundComment;

    res.status(200).json({comment: {...rest, likesCount: _count.likes, ownCommentsCount: _count.ownComments}});
    return;
});

const getComments = asyncHandler(async (req, res) => {
    const formData = matchedData(req);

    const foundComments = await getThisCommentComments(formData.id, getTakeAndSkip({amount: formData.amount, skip: formData.skip}), req.user?.id);

    if (!foundComments) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    res.status(200).json({comments: foundComments.map(({_count, ...val}) => ({...val, likesCount: _count.likes, ownCommentsCount: _count.ownComments}))})
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
    getComments,
};