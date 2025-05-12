import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { changeCommentLike, deleteThisComment, fetchCommentForCheck, getThisComment, updateThisComment } from "../util/queries";
import { deleteFiles } from "../util/helperFunctions";

const updateComment = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    const fetchedComment = await fetchCommentForCheck(req.user.id, formData.id);
    if (!fetchedComment) {
        res.status(400).json({message: "Comment not found."});
        return;
    }
    if (!fetchedComment.image && formData.content === "") {
        res.status(400).json({message: "Comment can't be empty."});
        return;
    };

    const updatedComment = await updateThisComment(req.user.id, formData.id, formData.content);

    if (!updatedComment) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

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
    
    res.status(200).json();
    return;
});

const getComment = asyncHandler(async (req, res) => {
    const formData = matchedData(req);

    const foundComment = await getThisComment(formData.id);

    if (!foundComment) {
        res.status(400).json({message: "Comment not found."});
        return;
    };

    const {_count, ownComments, ...rest} = foundComment;

    res.status(200).json({comment: {...rest, likes: _count.likes, 
        ownComments: ownComments.map(({_count, ...val}) => ({...val, likes: _count.likes}))}});
    return;
});

const changeLike = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    const changedComment = await changeCommentLike(req.user.id, formData.id, formData.action === "ADD" && "connect" || "disconnect");

    if (!changedComment) {
        res.status(400).json({message: "Comment not found."});
        return;
    };

    res.status(200).json();
    return;
});


export {
    updateComment,
    deleteComment,
    getComment,
    changeLike,
};