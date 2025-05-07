import prisma from "../config/client";
import { UserUpdate } from "./types";

const getUserByNameForSession = async function getUserFromDatabaseByUsername(
    username: string, pass = false
  ) {
    const possibleUser = await prisma.user.findFirst({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        ...(pass ? {password: true} : {})
      }
    });
  
    return possibleUser;
};
  
const getUserForSession = async function getUserFromDatabase(id: string, pass=false) {
    const possibleUser = await prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
        ...(pass ? {password: true} : {})
      },
    });
    return possibleUser;
};

const createUser = async function createUserInDatabase(username: string, password: string, date: Date) {
    const possibleUser = await prisma.user.create({
      data: {
        username,
        password,
        joinedAt: date,
        icon: {
          connect: {
            id: 1
          }
        }
      }
    });

  return possibleUser;
};

const getMyNotifications = async function getCurrentUserNotifications(userid: string) {
    const possibleNotifications = await prisma.notification.findMany({
      where: {
        userid
      }
    });

  return possibleNotifications;
};

const deleteNotification = async function deleteThisNotificationByUser(userid: string, notifid: string) {
  const possibleNotification = await prisma.notification.delete({
    where: {
      userid,
      id: notifid
    }
  });
  return possibleNotification;
};

const clearAllMyNotifications = async function deleteAllNotificationsOfUser(userid: string) {
  const possibleNotifications = prisma.notification.deleteMany({
    where: {
      userid
    }
  });
  return possibleNotifications;
};

const getSelfIconsInfo = async function getAllInfoFromUser(userid: string) {
  const userInfo = await prisma.user.findFirst({
    where: {
      id: userid,
    },
    select: {
      id: true,
      username: true,
      icon: true,
      customIcon: true,
    },
  });

  return userInfo;
};

const getIconInfo = async function getIconFromId(iconid: number) {
  const iconInfo = await prisma.icon.findFirst({
    where: {
      id: iconid,
    },
  });

  return iconInfo;
};


const deleteCustomIcon = async function deleteCustomIconWhenNormalIconIsChosen(
  customid: string,
) {
  const deletedIcon = await prisma.customIcon.delete({
    where: {
      id: customid,
    },
  });
  return deletedIcon;
};

const changeUserInfo = async function updateUserDetails(
  userid: string,
  options: UserUpdate,
) {
  const { icon, customIcon, ...rest } = options;
  const updatedUser = await prisma.user.update({
    where: {
      id: userid,
    },
    data: {
      ...rest,
      ...(icon
        ? {
            icon: {
              connect: {
                id: icon,
              },
            },
          }
        : {}),
      ...(customIcon
        ? {
            customIcon: {
              create: {
                url: customIcon.secure_url,
                public_id: customIcon.public_id,
                uploadAt: customIcon.created_at,
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      joinedAt: true,
      icon: true,
      username: true,
      aboutMe: true,
      customIcon: true,
    },
  });

  return updatedUser;
};

export {
  getUserByNameForSession,
  getUserForSession,
  createUser,
  getMyNotifications,
  deleteNotification,
  clearAllMyNotifications,
  getSelfIconsInfo,
  getIconInfo,
  deleteCustomIcon,
  changeUserInfo,
};