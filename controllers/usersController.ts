import asyncHandler from "express-async-handler";
import { deleteLocalFile, deleteFiles, clearFilesIfError, uploadFile } from "../util/helperFunctions";
import { type UploadApiResponse } from "cloudinary";
import bcrypt from "bcryptjs";
import { getUserByNameForSession, getUserForSession, getSelfIconsInfo, getIconInfo, deleteCustomIcon, changeUserInfo } from "../util/queries";
import { matchedData } from "express-validator";

const updateMyself = asyncHandler(async (req, res) => {
    if (!req.user) {
        await deleteLocalFile(req.file);
        res.status(400).json();
        return;
    }
    
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

export {
    updateMyself,
};