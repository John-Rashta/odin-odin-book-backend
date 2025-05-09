import asyncHandler from "express-async-handler";
import { changePostLike, createThisComment, createThisPost, deleteThisPost, fetchPostForCheck, getImagesInPostForDelete, getThisPost, getThisUserPosts, updatePostContent } from "../util/queries";
import { matchedData } from "express-validator";
import { deleteFiles, deleteLocalFile, uploadFile } from "../util/helperFunctions";

const getMyPosts = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  };

  const myPosts = await getThisUserPosts(req.user.id);

  if (!myPosts) {
    res.status(500).json({message: "Internal Error"});
    return;
  };

  res.status(200).json({posts: myPosts});
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
        res.status(400).json();
        return;
    };

    let fileInfo;

    if (req.file) {
        fileInfo = await uploadFile(req.file);
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
    res.status(200).json();
    return;
});

const getPost = asyncHandler(async (req, res) => {
    const formData = matchedData(req);

    const possiblePost = await getThisPost(formData.id);

    if (!possiblePost) {
        res.status(400).json({message: "Post not found."});
        return;
    };

    const { _count,...restPost} = possiblePost;

    res.status(200).json({post: {...restPost, likes: _count.likes}});
    return;
});

const updatePost = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);
    const fetchedPost = await fetchPostForCheck(req.user.id, formData.id);
    if (!fetchedPost) {
        res.status(400).json({message: "Post not found."});
        return;
    }
    if (!fetchedPost.image && formData.content === "") {
        res.status(400).json({message: "Post can't be empty."});
        return;
    };

    const updatedPost = await updatePostContent(req.user.id, formData.id, formData.content);

    if (!updatedPost) {
        res.status(500).json({message: "Internal Error"});
        return;
    };

    res.status(200).json();
    return;
});

const changeLike = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    const changedPost = await changePostLike(req.user.id, formData.id, formData.action === "ADD" && "connect" || "disconnect");

    if (!changedPost) {
        res.status(400).json({message: "Post not found."});
        return;
    };

    res.status(200).json();
    return;
});

const postComment = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    const formData = matchedData(req);

    if (!formData.content && !req.file) {
        res.status(400).json();
        return;
    };

    let fileInfo;

    if (req.file) {
        fileInfo = await uploadFile(req.file);
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
    
    res.status(200).json();
})



export {
    getMyPosts,
    createPost,
    deletePost,
    getPost,
    updatePost,
    changeLike,
    postComment,
};