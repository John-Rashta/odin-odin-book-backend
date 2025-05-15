import { notificationTypes, requestTypes } from "./types";

interface ServerToClientEvents {
    request: (data: RequestSocketOptions) => void,
    notification: (data: NotificationSocket) => void,
    follows: (data: FollowsSocket) => void,
    userUpdate: (data: UserUpdateSocket) => void,
    followers: (data: FollowersSocket) => void,
    commentUpdate: (data: CommentUpdateSocket) => void,
    commentDelete: (data: CommentDeleteSocket) => void,
    extraNotifications: (data: BasicId & NotificationSocket) => void,
    postDelete: (data: BasicId) => void,
    postUpdate: (data: PostUpdateSocket) => void,
    commentNew: (data: NewCommentSocket) => void,
};

interface ClientToServerEvents {
    "post:join": (payload: PayloadClient, callback: (res: Response) => void) => void,
    "user:join": (payload: PayloadClient, callback: (res: Response) => void) => void,
};

type Response = Error | Success;

interface Success {
    status: string
};

interface Error {
  error: string;
  errorDetails?: {
    message: string;
    path: Array<string | number>;
    type: string;
  }[];
}

interface BasicId {
    id: string
};

interface PayloadClient {
    id: string,
    comments?: "yes"
}

interface RequestSocketOptions {
    action: "REMOVE" | "ADD",
    data: {
        id?: string,
        userid?: string,
        request?: {
            sender: {
        id: string;
        username: string;
            };
        } & {
        id: string;
        type: requestTypes;
        targetid: string;
        senderid: string;
        sentAt: Date;
        }
    }
};

interface NotificationSocket {
    notification: {
        id: string;
        content: string;
        type: notificationTypes;
        createdAt: Date;
        typeid: string | null;
    }
};

interface FollowsSocket  {
    action: "ADD" | "REMOVE",
    data: {
        id: string;
        username: string;
        icon: {
            source: string;
        };
        customIcon: {
            url: string;
        } | null;
    }
};

interface UserUpdateSocket {
    type: "followers" | "follows" | "user",
    newCount?: number,
    id: string,
    data?: {
        icon: {
        source: string;
        };
        customIcon: {
            url: string;
        } | null;
    } & {
        id: string;
        username: string;
        iconid: number;
        aboutMe: string | null;
        joinedAt: Date;
    }
};

interface FollowersSocket {
    action: "ADD" | "REMOVE",
    id: string,
};

interface CommentUpdateSocket {
    type: "comment" | "likes",
    likes?: number,
    id: string,
    comment?: CommentType
};

interface CommentDeleteSocket {
    id: string,
    commentid: string,
};

interface PostUpdateSocket {
    type: "content" | "likes",
    id: string,
    likes?: number,
    content?: string,
};

interface NewCommentSocket {
    id: string,
    comment: CommentType
}

interface CommentType {
    likes: number;
    ownCommentsCount: number;
    sender: {
        id: string;
        username: string;
        icon: {
            source: string;
        };
        customIcon: {
            url: string;
        } | null;
    };
    image: {
        url: string;
    } | null;
    id: string;
    content: string;
    postid: string;
    sentAt: Date;
    senderid: string;
    commentid: string | null;
    edited: boolean;
    
}

export {
    ServerToClientEvents,
    ClientToServerEvents,
    Response
};