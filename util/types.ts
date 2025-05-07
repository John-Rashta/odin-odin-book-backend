import { type UploadApiResponse } from "cloudinary";

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
  

export {
    UserProfile,
    UserUpdate,
    UserOptions,
};
  