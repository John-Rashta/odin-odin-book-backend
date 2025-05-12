import prisma from "../config/client";
import { CommentOptions, NotificationsOptions, PostOptions, RequestOptions, SearchOptions, UserUpdate } from "./interfaces";
import { followTypes, likeActions, requestUsers } from "./types";

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
      },
      omit: {
        password: true
      },
    });

  return possibleUser;
};

const getMyNotifications = async function getCurrentUserNotifications(userid: string) {
    const possibleNotifications = await prisma.notification.findMany({
      where: {
        user: {
          some: {
            id: userid
          }
        }
      }
    });

  return possibleNotifications;
};

const removeNotification = async function removeThisNotificationByUser(userid: string, notifid: string) {
  const possibleUser = await prisma.user.update({
    where: {
      id: userid
    },
    data: {
      notifications: {
        disconnect: {
          id: notifid
        }
      }
    },
    omit: {
      password: true
    },
  });
  return possibleUser;
};

const clearAllMyNotifications = async function removeAllNotificationsOfUser(userid: string) {
  const possibleUser = prisma.user.update({
    where: {
      id: userid
    },
    data: {
      notifications: {
        set: []
      }
    },
    omit: {
      password: true
    },
  });
  return possibleUser;
};

const getSelfIconsInfo = async function getAllIconsInfoFromUser(userid: string) {
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
      icon: {
        select: {
          source: true
        }
      },
      username: true,
      aboutMe: true,
      customIcon: {
        select: {
          url: true
        }
      },
    },
  });

  return updatedUser;
};

const getUserReceivedRequests = async function getAllReceivedRequestsOfUser(userid: string) {
  const possibleRequests = await prisma.request.findMany({
    where: {
      targetid: userid
    },
    orderBy: {
      sentAt: "desc"
    },
    include: {
      sender: {
        select: {
          username: true,
          id: true,
        }
      }
    }
  });

  return possibleRequests;
};

const getUserSentRequests = async function getAllSentRequestsByUser(userid: string) {
  const possibleRequests = await prisma.request.findMany({
    where: {
      senderid: userid
    },
    orderBy: {
      sentAt: "desc"
    },
    include: {
      target: {
        select: {
          username: true,
          id: true,
        }
      }
    }
  });

  return possibleRequests;
};

const deleteThisRequest = async function deleteRequestWhereUserIsPresent(userid: string, requestid: string, userType?: requestUsers ) {
  const possibleRequest = await prisma.request.delete({
    where: {
      id: requestid,
      ...(typeof userType === "string" 
        ? { [userType]: userid }
        : {
          OR: [
            {
              targetid: userid
            },
            {
              senderid: userid
            }
        ]}
      ),
    }
  });

  return possibleRequest;
};

const createFollowship = async function makeUserFollowAnotherUser(userid: string, targetid: string) {
  const possibleUser = await prisma.user.update({
    where: {
      id: userid
    },
    data: {
      follows: {
        connect: {
          id: targetid
        }
      }
    },
    omit: {
      password: true
    }
  });

  return possibleUser;
};

const stopFollowship = async function makeUserStopFollowAnotherUser(userid: string, targetid: string) {
  const possibleUser = await prisma.user.update({
    where: {
      id: userid
    },
    data: {
      follows: {
        disconnect: {
          id: targetid
        }
      }
    },
    omit: {
      password: true
    },
  });

  return possibleUser;
};

const makeRequest = async function makeRequestByUser(options: RequestOptions) {
  const possibleRequest = await prisma.request.create({
    data: {
      ...options
    }
  });

  return possibleRequest;
};

const createNotification = async function createNotificationForAction(options: NotificationsOptions) {
  const createdNotification = await prisma.notification.create({
    data: {
      createdAt: options.createdAt,
      content: options.content,
      type: options.type,
      ...(typeof options.typeid === "string" ? {typeid: options.typeid} : {}),
      user: {
        connect: options.usersid.map(user => ({id: user})) || []
      }
    }
  });
  return createdNotification;
};

const getSomeUsers = async function getSomeUsersFromDatabase(options: SearchOptions) {
  const possibleUsers = prisma.user.findMany({
    ...(typeof options.username === "string" ? {
      where: {
        username: {
          contains: options.username
        }
      }
    } : {}),
    orderBy: {
      username: "asc"
    },
    include: {
        ...(typeof options.userid === "string" ? {
          receivedRequests: {
            where: {
              id: options.userid
            },
            select: {
              id: true,
            },
          },
          followers: {
            where: {
              id: options.userid
            },
            select: {
              id: true,
            },
          }
      } : {}),
      icon: {
        select: {
          source: true
        }
      },
      customIcon: {
        select: {
          url: true,
        }
      }
    },
    omit: {
      password: true,
    },
    take: 30,
  });

  return possibleUsers;
};

const getThisUser = async function getSpecificUser(userid: string, myId?: string) {
  const possibleUser = await prisma.user.findFirst({
    where: {
      id: userid
    },
    include: {
      _count: {
        select: {
          followers: true,
        }
      },
      icon: {
        select: {
          source: true,
        }
      },
      customIcon: {
        select: {
          url: true,
        },
      },
      ...(typeof myId === "string" ? {
        receivedRequests: {
          where: {
            id: myId
          },
          select: {
            id: true,
          },
        },
        followers: {
          where: {
            id: myId
          },
          select: {
            id: true,
          },
      }
      } : {}),
    },
    omit: {
      password: true
    },
  });
  
  return possibleUser;
};

const getThisUserPosts = async function getAllOfUserPosts(userid: string) {
  const possiblePosts = await prisma.post.findMany({
    where: {
      creatorid: userid
    },
    include: {
      _count: {
        select: {
          likes: true
        }
      },
      image: {
        select: {
          url: true
        }
      },
      creator: {
        select: {
          id: true,
          username: true,
          icon: {
            select: {
              source: true,
            }
          },
          customIcon: {
            select: {
              url: true,
            },
          },
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return possiblePosts;
};

const getMyFollowships = async function getAllOfUserFollowships(userid: string, type: followTypes) {
  const possibleFollowers = await prisma.user.findMany({
    where: {
      [type]: {
        some: {
          id: userid
        }
      },
    },
    select: {
      id: true,
      username: true,
      icon: {
        select: {
          source: true,
        }
      },
      customIcon: {
        select: {
          url: true,
        }
      }
    }
  });

  return possibleFollowers;
};

const getUserFeed = async function getSomeOfUserFeed(userid: string) {
  const myFeed = await prisma.post.findMany({
    where: {
      creator: {
        OR: [
          {
            followers: {
              some: {
                id: userid
              }
            },
          },
          {
            id: userid
          }
        ]
      }
    },
    include: {
      image: {
        select: {
          url: true
        }
      },
      _count: {
        select: {
          likes: true
        }
      },
      creator: {
        select: {
          id: true,
          username: true,
          icon: {
            select: {
              source: true,
            }
          },
          customIcon: {
            select: {
              url: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 30,
  });

  return myFeed;
};

const getImagesInPostForDelete = async function getAllImagesInPostForDeletePurposes(userid: string, postid: string) {
  const allImages = await prisma.customImage.findMany({
    where: {
      OR: [
      {
        comment: {
          AND: [
            {
              postid,
            },
            {
              post:  
                {
                  creatorid: userid
                }
            }
          ]
        }
      },
      {
        AND: [
          {
            postid,
          },
          {
            post: {
              creatorid: userid
            }
          }
        ]
      }
    ]
  }
})

  return allImages;
};

const deleteThisPost = async function deleteThisPostByUser(userid: string, postid: string) {
  const deletedPost = await prisma.post.delete({
    where: {
      creatorid: userid,
      id: postid
    }
  });

  return deletedPost;
};

const createThisPost = async function createPostForUser(options: PostOptions) {
  const createdPost = await prisma.post.create({
    data: {
      creator: {
        connect: {
          id: options.userid
        }
      },
      createdAt: options.createdAt,
      content: options.content,
      ...(options.fileInfo ? {
        image: {
          create: {
            url: options.fileInfo.secure_url,
            public_id: options.fileInfo.public_id,
            uploadAt: options.fileInfo.created_at,
          }
        }
      }: {})
    }
  });

  return createdPost;
};

const getThisPost = async function getSpecificPostFromDatabase(postid: string) {
  const possiblePost = await prisma.post.findFirst({
    where: {
      id: postid
    },
    include: {
      image: {
        select: {
          url: true
        }
      },
      _count: {
        select: {
          likes: true
        }
      },
      comments: {
        where: {
          comment: {
            is: null
          }
        },
        include: {
          image: {
            select: {
              url: true
            }
          },
          _count: {
            select: {
              likes: true
            }
          },
          sender: {
            select: {
              id: true,
              username: true,
              icon: {
                select: {
                  source: true,
                }
              },
              customIcon: {
                select: {
                  url: true,
                }
              }
            }
          }
        }
      },
      creator: {
        select: {
          id: true,
          username: true,
          icon: {
            select: {
              source: true,
            }
          },
          customIcon: {
            select: {
              url: true
            }
          }
        },
      }
    }
  });

  return possiblePost;
};

const fetchPostForCheck = async function fetchPostForUpdatingPurposes(userid: string, postid: string) {
  const fetchedPost = await prisma.post.findFirst({
    where: {
      creatorid: userid,
      id: postid
    },
    include: {
      image: true
    }
  });

  return fetchedPost;
};

const updatePostContent = async function updateContentOfSpecificPostByUser(userid: string, postid: string, content: string) {
  const updatedPost = await prisma.post.update({
    data: {
      content,
      edited: true,
    },
    where: {
      id: postid,
      creatorid: userid,
    },
  });
  
  return updatedPost;
};

const changePostLike = async function changeLikeOfUserOnPost(userid: string, postid: string, action: likeActions) {
  const changedPost = await prisma.user.update({
    where: {
      id: userid,
    },
    data: {
      likedPosts: {
        [action]: {
          id: postid
        }
      }
    },
    omit: {
      password: true
    }
  });

  return changedPost;
};

const createThisComment = async function createCommentOnPostAndOrComment(options: PostOptions & CommentOptions) {
  const updatedPost = await prisma.post.update({
    data: {
      comments: {
        create: {
          content: options.content,
          sentAt: options.createdAt,
          sender: {
            connect: {
              id: options.userid
            }
          },
          ...(typeof options.commentid === "string" 
            ? 
            {
              comment: {
                connect: {
                  id: options.commentid
                }
              }
            }
            : {}),
          ...(options.fileInfo ? {
            image: {
              create: {
                url: options.fileInfo.secure_url,
                public_id: options.fileInfo.public_id,
                uploadAt: options.fileInfo.created_at,
              }
            }
          }: {})
        }
      }

    },
    where: {
      id: options.postid,
      ...(typeof options.commentid === "string"
        ? 
        {
          comments: {
            some: {
              id: options.commentid
            }
          }
        }
        : {}
      )
    },
    include: {
      comments: {
        orderBy: {
          sentAt: "desc"
        },
        take: 1,
      }
    }
  });

  return updatedPost;
};

const fetchCommentForCheck = async function fetchCommentForUpdatingPurposes(userid: string, commentid: string) {
  const possibleComment = await prisma.comment.findFirst({
    where: {
      id: commentid,
      senderid: userid
    },
    include: {
      image: {
        select: {
          id: true
        }
      }
    }
  });

  return possibleComment;
};

const updateThisComment = async function updateCommentByUser(userid: string, commentid: string, content: string) {
  const updatedComment = await prisma.comment.update({
    where: {
      id: commentid,
      senderid: userid
    },
    data: {
      content,
      edited: true
    }
  })
  return updatedComment;
};

const deleteThisComment = async function deleteCommentByUser(userid: string, commentid: string) {
  const deletedComment = await prisma.comment.delete({
    where: {
      id: commentid,
      senderid: userid,
    },
    include: {
      image: true
    }
  });

  return deletedComment;
};

const changeCommentLike = async function changeLikeOfUserOnComment(userid: string, commentid: string, action: likeActions) {
const changedComment = await prisma.user.update({
    where: {
      id: userid,
    },
    data: {
      likedComments: {
        [action]: {
          id: commentid
        }
      }
    },
    omit: {
      password: true
    }
  });

  return changedComment;
};

const getThisComment = async function getCommentAndItsChildren(commentid: string) {
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentid
    },
    include: {
      image: {
        select: {
          url: true,
        }
      },
      _count: {
        select: {
          likes: true
        }
      },
      sender: {
        select: {
          id: true,
          username: true,
          icon: {
            select: {
              source: true
            }
          },
          customIcon:  {
            select: {
              url: true,
            }
          }
        }
      },
      ownComments: {
        include: {
          _count: {
            select: {
              likes: true
            }
          },
          image: {
            select: {
              url: true
            }
          },
          sender: {
            select: {
              id: true,
              username: true,
              icon: {
                select: {
                  source: true,
                }
              },
              customIcon: {
                select: {
                  url: true,
                }
              }
            }
          }
        }
      }
    }
  });

  return commentData;
};

const getAllFollowsForIo = async function getFollowsForSocketStuff(userid: string) {
  const allFollows = await prisma.user.findMany({
    where: {
      followers: {
        some: {
          id: userid
        }
      }
    },
    select: {
      id: true
    }
  });

  return allFollows;
};

export {
  getUserByNameForSession,
  getUserForSession,
  createUser,
  getMyNotifications,
  removeNotification,
  clearAllMyNotifications,
  getSelfIconsInfo,
  getIconInfo,
  deleteCustomIcon,
  changeUserInfo,
  getUserReceivedRequests,
  getUserSentRequests,
  deleteThisRequest,
  createFollowship,
  stopFollowship,
  makeRequest,
  createNotification,
  getSomeUsers,
  getThisUser,
  getThisUserPosts,
  getMyFollowships,
  getUserFeed,
  getImagesInPostForDelete,
  deleteThisPost,
  createThisPost,
  getThisPost,
  fetchPostForCheck,
  updatePostContent,
  changePostLike,
  createThisComment,
  fetchCommentForCheck,
  updateThisComment,
  deleteThisComment,
  changeCommentLike,
  getThisComment,
  getAllFollowsForIo,
};