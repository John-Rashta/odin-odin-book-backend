import express from "express";
import session from "express-session";
import passport from "passport";
import "dotenv/config";
import cors from "cors";
import { errorHandler } from "./middleware/errorMiddleware";
import prisma from "./config/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { createServer } from "http";
import { DefaultEventsMap, Server } from "socket.io";
import { type Request, type Response, type NextFunction } from "express";
import authRoute from "./routes/authRoute";
import usersRoute from "./routes/usersRoute";
import notificationsRoute from "./routes/notificationsRoute";
import requestsRoute from "./routes/requestsRoute";
import postsRoute from "./routes/postsRoute";
import commentsRoute from "./routes/commentsRoute";
import { getAllFollowsForIo } from "./util/queries";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./util/socketTypesInters";
import { joinPost } from "./sockets/joinPost";
import { joinUser } from "./sockets/joinUser";
import { leavePost } from "./sockets/leavePost";
import { leaveUser } from "./sockets/leaveUser";

const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

const corsOptions = { credentials: true, origin: ["http://localhost:5173"] };

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

const sessionStuff = session({
  secret: process.env.SECRET as string,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  },
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, //ms
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
});

app.use(sessionStuff);

import "./config/passport";
import { joinFollow } from "./sockets/joinFollow";
import { leaveFollow } from "./sockets/leaveFollow";

app.use(passport.initialize());
app.use(passport.session());

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>(httpServer, { cors: corsOptions });

app.use(function (req: Request, res: Response, next: NextFunction) {
  req.io = io;
  next();
});

app.use("/auth", authRoute);
app.use("/users", usersRoute);
app.use("/notifications", notificationsRoute);
app.use("/requests", requestsRoute);
app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);

app.use(errorHandler);

function onlyForHandshake(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middleware: (req: Request, res: Response, next: any) => void,
) {
  return (
    req: Request & { _query: Record<string, string> },
    res: Response,
    next: (err?: Error) => void,
  ) => {
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
}

io.engine.use(onlyForHandshake(sessionStuff));
io.engine.use(onlyForHandshake(passport.session()));

io.on("connection", async (socket) => {
  const req = socket.request as Request & { user: Express.User };
  if (req.user) {
    socket.join(`self:${req.user.id}`);
    socket.join(`user:${req.user.id}`);
    socket.join(`user:${req.user.id}:follows`);
    socket.on("follow:join", joinFollow({ socket }));
    socket.on("follow:leave", leaveFollow({ socket }));
    const currentFollows = await getAllFollowsForIo(req.user.id, "followers");
    if (currentFollows) {
      currentFollows.forEach((val) => {
        socket.join(`user:${val.id}:follows`);
      });
    }
  }

  socket.on("post:join", joinPost({ socket }));
  socket.on("user:join", joinUser({ socket }));
  socket.on("post:leave", leavePost({ socket }));
  socket.on("user:leave", leaveUser({ socket }));
});

httpServer.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`application is running at: http://localhost:${PORT}`);
});
