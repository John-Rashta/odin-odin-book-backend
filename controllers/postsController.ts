import asyncHandler from "express-async-handler";
import { changePostLike, createNotification, createThisComment, createThisPost, deleteThisPost, getAllFollowsForIo, getImagesInPostForDelete, getThisPost, getThisPostComments, getThisUserPosts, updatePostContent } from "../util/queries";
import { matchedData } from "express-validator";
import { deleteFiles, deleteLocalFile, uploadFile } from "../util/helperFunctions";
import { getTakeAndSkip } from "../util/dataHelpers";

const getMyPosts = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  };

  const formData = matchedData(req);

  const myPosts = await getThisUserPosts(req.user.id, getTakeAndSkip({amount: formData.amount, skip: formData.skip}));

  if (!myPosts) {
    res.status(500).json({message: "Internal Error"});
    return;
  };

  res.status(200).json({posts: myPosts.map(({_count, ...val}) => ({ ...val, likesCount: _count.likes, ownCommentsCount: _count.comments }))});
  return;
});

const createPost = asyncHandler(async (req, res) => {
    if (!req.user) {
        await deleteLocalFile(req.file);
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    if (!formData.content && !req.file) {
        res.status(400).json({message: "Post can't be empty."});
        return;
    };

    let fileInfo;

    if (req.file) {
        fileInfo = await uploadFile(req.file);
         await deleteLocalFile(req.file);
    };

    const createdPost = await createThisPost({
        content: formData.content || req.file && "",
        userid: req.user.id,
        createdAt: new Date(),
        ...(req.file ? {fileInfo} : {}),
    });

    if (!createdPost) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    const getFollows = await getAllFollowsForIo(req.user.id);

    const createdNotification = await createNotification(
        {
        createdAt: createdPost.createdAt,
        content: `Check ${req.user.username} new Post!`,
        type: "POST",
        typeid: createdPost.id,
        usersid: getFollows.map((val) => val.id)
        }
    );

    if (createdNotification && req.io) {
        req.io.to(`user:${req.user.id}`).emit("extraNotifications", {notification: createdNotification, id: req.user.id});
        req.io.to(`user:${req.user.id}`).emit("post:created", {post: {...createdPost, likesCount: 0, ownCommentsCount: 0}, id: req.user.id});
    };

    res.status(200).json({postid: createdPost.id});
    return;
});

const deletePost = asyncHandler(async (req, res) => {
     if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    const allComments = await getImagesInPostForDelete(req.user.id, formData.id);

    if (allComments.length > 0) {
        await deleteFiles(allComments);
    };

    await deleteThisPost(req.user.id, formData.id);

    if (req.io) {
        req.io.to(`user:${req.user.id}`).emit("post:deleted", {id: formData.id});
    }
    res.status(200).json();
    return;
});

const getPostComments = asyncHandler(async (req, res) => {
    const formData = matchedData(req);

    const possibleComments = await getThisPostComments(formData.id, getTakeAndSkip({amount: formData.amount, skip: formData.skip}), req.user?.id);

    if (!possibleComments) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    res.status(200).json({comments: 
        possibleComments.map(({_count, ...val}) => ({...val, likesCount: _count.likes, ownCommentsCount: _count.ownComments}))
    });
    return;
});

const getPost = asyncHandler(async (req, res) => {
    const formData = matchedData(req);

    const possiblePost = await getThisPost(formData.id, req.user?.id);

    if (!possiblePost) {
        res.status(400).json({message: "Post not found."});
        return;
    };

    const { _count, ...restPost} = possiblePost;

    res.status(200).json({post: 
        {
            ...restPost, 
            likesCount: _count.likes,
            ownCommentsCount: _count.comments,
        }
    });
    return;
});

const updatePost = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    const updatedPost = await updatePostContent(req.user.id, formData.id, formData.content);

    const { _count, ...restPost} = updatedPost;

    if (req.io) {
        req.io.to(`post:${updatedPost.id}`).to(`user:${req.user.id}`).emit("post:updated", {type: "content",id: updatedPost.id, content: updatedPost.content, userid: updatedPost.creatorid})
    }

    res.status(200).json({post: {
        ...restPost,
        likesCount: _count.likes,
    }});
    return;
});

const changeLike = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    const changedPost = await changePostLike(req.user.id, formData.id, formData.action === "ADD" && "connect" || "disconnect");
    const { _count, ...rest } = changedPost;
    if (req.io) {
        req.io.to(`post:${changedPost.id}`).emit("post:updated", {type: "likes", likes: _count.likes, id: changedPost.id, userid: changedPost.creatorid})
    };

    res.status(200).json({post: rest});
    return;
});

const postComment = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    if (!formData.content && !req.file) {
        res.status(400).json({message: "Comment can't be empty."});
        return;
    };

    let fileInfo;

    if (req.file) {
        fileInfo = await uploadFile(req.file);
        await deleteLocalFile(req.file);
    };

    const updatedPost = await createThisComment({
        userid: req.user.id,
        createdAt: new Date(),
        content: formData.content || req.file && "",
        postid: formData.id,
        ...(formData.comment ? {commentid: formData.comment} : {}),
        ...(req.file ? {fileInfo} : {}),
    });

    if (!updatedPost) {
        res.status(500).json({message: "Internal Error"});
        return;
    };
    
    const {_count, comment, ...noCountComment } = updatedPost.comments[0];
    const properComment = {...noCountComment, likesCount: _count.likes, ownCommentsCount: _count.ownComments};
    let newNotification;

    if (comment) {
        newNotification = await createNotification({
            createdAt: noCountComment.sentAt,
            content: `${req.user.username} responded to your comment!`,
            type: "COMMENT",
            typeid: comment.id,
            usersid: [comment.sender.id]
        });
    };

    if (req.io) {
        req.io.to(`post:${updatedPost.id}:comments`).emit("comment:created", {id: updatedPost.id, comment: properComment});
        if (newNotification && comment) {
            req.io.to(`self:${comment.sender.id}`).emit("notification", {notification: newNotification});
        }
    };
    res.status(200).json({comment: properComment});
    return;
})



export {
    getMyPosts,
    createPost,
    deletePost,
    getPost,
    updatePost,
    changeLike,
    postComment,
    getPostComments
};