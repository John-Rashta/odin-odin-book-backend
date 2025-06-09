import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { changeCommentLike, deleteThisComment, getCommentForCheck, getThisComment, getThisCommentComments, updateThisComment } from "../util/queries";
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
        req.io.to(`post:${updatedComment.postid}:comments`).emit("comment:updated",  {type: "comment", postid: updatedComment.postid, id: updatedComment.id, comment: properComment, ...(updatedComment.commentid ? {parentid: updatedComment.commentid}: {})})
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
        let parentComment;
        if (deletedComment.commentid) {
            parentComment = await getCommentForCheck(deletedComment.commentid);
        };
       
        req.io.to(`post:${deletedComment.postid}:comments`).emit("comment:deleted", {id: deletedComment.id, postid: deletedComment.postid, 
            ...(deletedComment.commentid ? {parentid: deletedComment.commentid}: {}),
            ...((parentComment && parentComment.commentid) ? {superparentid: parentComment.commentid}: {}),
        });
    }
    res.status(200).json({id: deletedComment.id, postid: deletedComment.postid, ...(deletedComment.commentid ? {parentid: deletedComment.commentid}: {})});
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
    const {_count, ...rest } = changedComment;

    if (req.io) {
        req.io.to(`post:${changedComment.postid}:comments`).emit("comment:updated", {type:"likes", postid: changedComment.postid ,id: changedComment.id, likes: _count.likes, ...(changedComment.commentid ? {parentid: changedComment.commentid}: {})});
    }
    res.status(200).json({comment: rest});
    return;
});


export {
    updateComment,
    deleteComment,
    getComment,
    changeLike,
    getComments,
};