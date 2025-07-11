import { type UploadApiResponse } from "cloudinary";
import { notificationTypes, requestTypes } from "./types";

interface RequestOptions {
  targetid: string;
  senderid: string;
  sentAt: Date;
  type: requestTypes;
}

interface UserProfile {
  aboutMe?: string;
  icon?: number;
}

interface UserOptions {
  username?: string;
  password?: string;
}

interface UserUpdate extends UserProfile, UserOptions {
  customIcon?: UploadApiResponse;
}

interface NotificationsOptions {
  createdAt: Date;
  content: string;
  type: notificationTypes;
  typeid?: string;
  usersid: string[];
}

interface SearchOptions {
  userid?: string;
  username?: string;
}

interface PostOptions {
  content: string;
  fileInfo?: UploadApiResponse;
  userid: string;
  createdAt: Date;
}

interface CommentOptions {
  commentid?: string;
  postid: string;
}

interface TakeAndSkip {
  take: number;
  skip: number;
}

interface FileData {
  id: string;
  public_id: string;
  url: string;
  uploadAt: Date;
}

export {
  RequestOptions,
  UserOptions,
  UserProfile,
  UserUpdate,
  NotificationsOptions,
  SearchOptions,
  PostOptions,
  CommentOptions,
  TakeAndSkip,
  FileData,
};
