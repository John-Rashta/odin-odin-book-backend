import { type UploadApiResponse } from "cloudinary";
import { notificationTypes, requestTypes } from "./types";

interface RequestOptions {
    targetid: string,
    senderid: string,
    sentAt: Date,
    type: requestTypes
};

interface UserProfile {
    aboutMe?: string;
    icon?: number;
};

interface UserOptions {
    username?: string;
    password?: string;
};

interface UserUpdate extends UserProfile, UserOptions {
    customIcon?: UploadApiResponse;
};

interface notificationsOptions {
    createdAt: Date,
    content: string,
    type: notificationTypes,
    typeid?: string,
    usersid: string[],
};

interface searchOptions {
    userid?: string,
    username?: string,
  };

export {
    RequestOptions,
    UserOptions,
    UserProfile,
    UserUpdate,
    notificationsOptions,
    searchOptions,
};