import asyncHandler from "express-async-handler";
import { deleteLocalFile, deleteFiles, clearFilesIfError, uploadFile } from "../util/helperFunctions";
import { type UploadApiResponse } from "cloudinary";
import bcrypt from "bcryptjs";
import { getUserByNameForSession, getUserForSession, getSelfIconsInfo, getIconInfo, deleteCustomIcon, changeUserInfo, stopFollowship, getThisUser, getSomeUsers, getMyFollowships, getThisUserPosts, getUserFeed } from "../util/queries";
import { matchedData } from "express-validator";
import { isUUID } from "validator";

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
          await changeUserInfo(req.user.id, {
            ...rest,
            password: hashedPassword,
            ...(req.file ? { customIcon: fileInfo } : {}),
          });
          await deleteLocalFile(req.file);
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
    await changeUserInfo(req.user.id, {
      ...formData,
      ...(req.file ? { customIcon: fileInfo } : {}),
    });
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

  res.status(200).json({user: myInfo})
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
  
      res.status(200).json({user: [possibleUser]});
      return;
    };
  
    const possibleUsers = await getSomeUsers({
      username: formData.user, userid: req.user?.id || undefined
    });
  
    if (!possibleUsers) {
      res.status(500).json({message: "Internal Error"});
      return;
    };
  
    res.status(200).json({users: possibleUsers});
    return;
  }

  const possibleUsers = await getSomeUsers({userid: req.user?.id || undefined });

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

  res.status(200).json({user: possibleUser});
  return;
});

const getMyFollowers = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  };

  const myFollowers = await getMyFollowships(req.user.id, "followers");

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

  const myFollows = await getMyFollowships(req.user.id, "follows");

  if (!myFollows) {
    res.status(500).json({message: "Internal Error"});
    return;
  };

  res.status(200).json({follows: myFollows});
  return;
});

const getUserPosts = asyncHandler(async (req, res) => {
  const formData = matchedData(req);

  const allPosts = await getThisUserPosts(formData.id);

  if (!allPosts) {
    res.status(400).json({message: "User not found."});
    return;
  };

  res.status(200).json({posts: allPosts});
  return;
});

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

const getMyFeed = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json();
    return;
  };

  const myFeed = await getUserFeed(req.user.id);

  if (!myFeed) {
    res.status(500).json({message: "Internal Error"});
    return;
  };

  res.status(200).json({feed: myFeed});
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
    getMyPosts,
    getUserPosts,
    getMyFeed,
};