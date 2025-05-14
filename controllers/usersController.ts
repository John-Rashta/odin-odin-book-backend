import asyncHandler from "express-async-handler";
import { deleteLocalFile, deleteFiles, clearFilesIfError, uploadFile } from "../util/helperFunctions";
import { type UploadApiResponse } from "cloudinary";
import bcrypt from "bcryptjs";
import { getUserByNameForSession, getUserForSession, getSelfIconsInfo, getIconInfo, deleteCustomIcon, changeUserInfo, stopFollowship, getThisUser, getSomeUsers, getMyFollowships, getThisUserPosts, getUserFeed } from "../util/queries";
import { matchedData } from "express-validator";
import { isUUID } from "validator";
import { getTakeAndSkip } from "../util/dataHelpers";

const updateMyself = asyncHandler(async (req, res) => {
    if (!req.user) {
        await deleteLocalFile(req.file);
        res.status(400).json();
        return;
    };
    
    const formData = matchedData(req);
    const userInfo = await getSelfIconsInfo(req.user.id);
    if (formData.icon) {
      const checkIcon = await getIconInfo(formData.icon);
      if (!checkIcon) {
        await deleteLocalFile(req.file);
        res.status(400).json({ message: "Invalid Icon Id" });
        return;
      }
    }
    let fileInfo: UploadApiResponse | undefined;
    if (req.file) {
      fileInfo = await uploadFile(req.file);
    }
  
    if (formData.username) {
      const alreadyUsed = await getUserByNameForSession(formData.username);
      if (alreadyUsed) {
        await clearFilesIfError(req.file, fileInfo);
        res.status(400).json({ message: "Invalid Username" });
        return;
      }
    }
  
    if (
      (formData.password && !formData.oldPassword) ||
      (formData.oldPassword && !formData.password)
    ) {
      await clearFilesIfError(req.file, fileInfo);
      res.status(400).json({ message: "Missing either old or new password" });
      return;
    }
  
    if (formData.password && formData.oldPassword) {
      const userPw = await getUserForSession(req.user.id, true);
      if (!userPw) {
        await clearFilesIfError(req.file, fileInfo);
        res.status(400).json();
        return;
      }
      const match = await bcrypt.compare(formData.oldPassword, userPw.password);
      if (!match) {
        await clearFilesIfError(req.file, fileInfo);
        res.status(400).json({ message: "Wrong old password" });
        return;
      }
      bcrypt.hash(formData.password, 10, async (err, hashedPassword) => {
        if (err) {
          console.log(err);
          await clearFilesIfError(req.file, fileInfo);
          res.status(500).json({ message: "Internal Error" });
          return;
        }
        if (req.user) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { oldPassword, ...rest } = formData;
          if ((formData.icon || req.file) && userInfo && userInfo.customIcon) {
            await deleteFiles([userInfo.customIcon]);
            await deleteCustomIcon(userInfo.customIcon.id);
          }
          const changedInfo = await changeUserInfo(req.user.id, {
            ...rest,
            password: hashedPassword,
            ...(req.file ? { customIcon: fileInfo } : {}),
          });
          await deleteLocalFile(req.file);
          if (req.io) {
            req.io.to(`user-${req.user.id}`).emit("user-update", {type: "user", data: changedInfo, id: req.user.id});
          };
          res.status(200).json();
          return;
        }
      });
      return;
    }
    if ((formData.icon || req.file) && userInfo && userInfo.customIcon) {
      await deleteFiles([userInfo.customIcon]);
      await deleteCustomIcon(userInfo.customIcon.id);
    }
    const changedInfo = await changeUserInfo(req.user.id, {
      ...formData,
      ...(req.file ? { customIcon: fileInfo } : {}),
    });

    if (req.io) {
            req.io.to(`user-${req.user.id}`).emit("user-update", {type: "user", data: changedInfo, id: req.user.id});
          };
   
    await deleteLocalFile(req.file);
    res.status(200).json();
    return;
});

const stopFollowing = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  };

  const formData = matchedData(req);

  const possibleUser = await stopFollowship(req.user.id, formData.id);

  if (!possibleUser) {
    res.status(500).json({message: "Internal Error"});
    return;
  };

  if (req.io) {
    req.io.to(`self-${possibleUser.id}`).emit("followers", {action: "REMOVE", id: req.user.id});
    req.io.to(`user-${possibleUser.id}`).emit("user-update", {type: "followers", newCount: possibleUser._count.followers, id: req.user.id});
  }

  res.status(200).json();
  return;
});

const getMyInfo = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  };

  const myInfo = await getThisUser(req.user.id);

  if (!myInfo) {
    res.status(500).json({message: "Internal Error"});
    return;
  };

  const { _count, ...rest } = myInfo;

  res.status(200).json({user: {...rest, followerCount: _count.followers}});
  return;
});

const getUsers = asyncHandler(async (req, res) => {
  const formData = matchedData(req);

  if (formData.user) {
    if (isUUID(formData.user)) {
      const possibleUser = await getThisUser(formData.user, req.user?.id || undefined);
      if (!possibleUser) {
        res.status(400).json({message: "User not found."});
        return;
      };

      const {_count, ...rest } = possibleUser;
  
      res.status(200).json({user: [{...rest, followerCount: _count.followers}]});
      return;
    };
  
    const possibleUsers = await getSomeUsers({
      username: formData.user, userid: req.user?.id || undefined
    }, getTakeAndSkip({amount: formData.amount, skip: formData.skip}));
  
    if (!possibleUsers) {
      res.status(500).json({message: "Internal Error"});
      return;
    };
  
    res.status(200).json({users: possibleUsers});
    return;
  }

  const possibleUsers = await getSomeUsers({userid: req.user?.id || undefined },
    getTakeAndSkip({amount: formData.amount, skip: formData.skip})
  );

  if (!possibleUsers) {
    res.status(500).json({message: "Internal Error"});
    return;
  };

  res.status(200).json({users: possibleUsers});
  return;
});

const getUser = asyncHandler(async (req, res) => {
  const formData = matchedData(req);

  const possibleUser = await getThisUser(formData.id, req.user?.id || undefined);

  if (!possibleUser) {
    res.status(400).json({message: "User not found."});
    return;
  };

  const {_count, ...rest } = possibleUser;

  res.status(200).json({user: {...rest, followerCount: _count.followers}});
  return;
});

const getMyFollowers = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  };

  const formData = matchedData(req);

  const myFollowers = await getMyFollowships(req.user.id, "followers", getTakeAndSkip({amount: formData.amount, skip: formData.skip}));

  if (!myFollowers) {
    res.status(500).json({message: "Internal Error"});
    return;
  };
  
  res.status(200).json({followers: myFollowers});
  return;
});

const getMyFollows = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  };

  const formData = matchedData(req);

  const myFollows = await getMyFollowships(req.user.id, "follows", getTakeAndSkip({amount: formData.amount, skip: formData.skip}));

  if (!myFollows) {
    res.status(500).json({message: "Internal Error"});
    return;
  };

  res.status(200).json({follows: myFollows});
  return;
});

const getUserPosts = asyncHandler(async (req, res) => {
  const formData = matchedData(req);

  const allPosts = await getThisUserPosts(formData.id, getTakeAndSkip({amount: formData.amount, skip: formData.skip}));

  if (!allPosts) {
    res.status(400).json({message: "User not found."});
    return;
  };

  res.status(200).json({posts: allPosts.map(({_count, ...val}) => ({...val, likes: _count.likes})) });
  return;
});

const getMyFeed = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  };

  const formData = matchedData(req);

  const myFeed = await getUserFeed(req.user.id, getTakeAndSkip({amount: formData.amount, skip: formData.skip}));

  if (!myFeed) {
    res.status(500).json({message: "Internal Error"});
    return;
  };

  res.status(200).json({feed: myFeed.map(({_count, ...val }) => ({...val, likes: _count.likes}))});
  return;
});

export {
    updateMyself,
    stopFollowing,
    getMyInfo,
    getUsers,
    getUser,
    getMyFollowers,
    getMyFollows,
    getUserPosts,
    getMyFeed,
};