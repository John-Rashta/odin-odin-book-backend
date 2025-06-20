import { cloudinary } from "../config/cloudinary";
import { promisify } from "node:util";
import fs from "fs";
import { UploadApiResponse } from "cloudinary";
import { FileData } from "./interfaces";
const unlinkWithAsync = promisify(fs.unlink);

type IdCollection = string[];
const deleteFiles = async function deleteFilesFromCloudinary(
  filesInfo: FileData[],
) {
  const allIds: IdCollection[] = [[]];
  filesInfo.forEach((file) => {
    if (allIds.at(-1)?.length === 100) {
      allIds.push([]);
    }
    allIds.at(-1)?.push(file.public_id);
  });
  if (allIds[0].length < 1) {
    return;
  }
  console.log(allIds)
  await Promise.all(
    allIds.map(async (idCollection) => {
      await cloudinary.api.delete_resources(idCollection, {
        resource_type: "image",
      });
    }),
  );
  return;
};

const deleteLocalFile = async function deleteFileFromTemporaryLocalStorage(
  fileStuff: Express.Multer.File | undefined,
) {
  if (!fileStuff) {
    return;
  }
  await unlinkWithAsync(fileStuff.path);
  return;
};

const uploadFile = async function uploadImageToCloudinary(
  fileStuff: Express.Multer.File,
) {
  const newImage = await cloudinary.uploader.upload(fileStuff.path, {
    resource_type: "image",
  });
  return newImage;
};

const clearFilesIfError = async function deleteFilesFromLocalAndCloud(
  fileStuff: Express.Multer.File | undefined,
  cloudStuff: UploadApiResponse | undefined,
) {
  if (fileStuff !== undefined) {
    await deleteLocalFile(fileStuff);
  }
  if (cloudStuff !== undefined) {
    await cloudinary.uploader.destroy(cloudStuff.public_id, {
      resource_type: "image",
    });
  }
  return;
};

export { deleteFiles, deleteLocalFile, uploadFile, clearFilesIfError };