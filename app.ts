import express from "express";
import session from "express-session";
import passport from "passport";
import "dotenv/config";
import cors from "cors";
import { errorHandler } from "./middleware/errorMiddleware";
import prisma from "./config/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { createServer } from "http";
import { Server } from "socket.io";
import { type Request, type Response, type NextFunction } from "express";
import authRoute from "./routes/authRoute";
import usersRoute from "./routes/usersRoute";
import notificationsRoute from "./routes/notificationsRoute";
import requestsRoute from "./routes/requestsRoute";
import postsRoute from "./routes/postsRoute";
import commentsRoute from "./routes/commentsRoute";
import { getAllFollowsForIo } from "./util/queries";

const PORT = 3000;

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
import { basicSchema } from "./util/socketValidator";

app.use(passport.initialize());
app.use(passport.session());

const io = new Server(httpServer, { cors: corsOptions });

app.use(function(req: Request, res: Response, next: NextFunction) {
  req.io = io;
  next();
});

app.use("/auth",authRoute);
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
};

io.engine.use(onlyForHandshake(sessionStuff));
io.engine.use(onlyForHandshake(passport.session()));

io.on("connection", async (socket) => {
  const req = socket.request as Request & { user: Express.User };

  if (req.user) {
    socket.join(`self-${req.user.id}`);
    const currentFollows = await getAllFollowsForIo(req.user.id);
    if (currentFollows) {
      currentFollows.forEach((val) => {
        socket.join(`user-${val.id}`);
      });
    };

    socket.on("post:join", (payload, callback) => {
      if (typeof callback !== "function") {
          return;
      };
      const { error, value } = basicSchema.validate(payload);
      if (error) {
        return callback({
          error: error.name,
          errorDetails: error.details,
        });
      };
      socket.join(`post-${value.id}`);
      if (value.comment === "yes") {
        socket.join(`post-${value.id}-comments`);
      };
      return callback({
            status: "OK",
      });
    });
    socket.on("user:join", (payload, callback) => {
      if (typeof callback !== "function") {
        return;
      };
      const { error, value } = basicSchema.validate(payload);
      if (error) {
        return callback({
          error: error.name,
          errorDetails: error.details,
        });
      };

      socket.join(`user-${value.id}`);
      return callback({
            status: "OK",
      });
    });

  };
});

httpServer.listen(PORT, () => {
  console.log(`application is running at: http://localhost:${PORT}`);
});