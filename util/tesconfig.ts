import express from "express";
import session from "express-session";
import passport from "passport";
import "dotenv/config";
import { errorHandler } from "../middleware/errorMiddleware";
import prisma from "../config/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import authRoute from "../routes/authRoute";
import usersRoute from "../routes/usersRoute";
import notificationsRoute from "../routes/notificationsRoute";
import requestsRoute from "../routes/requestsRoute";
import postsRoute from "../routes/postsRoute";
import commentsRoute from "../routes/commentsRoute";

const storeStuff = new PrismaSessionStore(prisma, {
  checkPeriod: 2 * 60 * 1000, //ms
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionStuff = session({
  secret: process.env.SECRET as string,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  },
  store: storeStuff,
});

app.use(sessionStuff);

import "../config/passport";

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoute);
app.use("/users", usersRoute);
app.use("/notifications", notificationsRoute);
app.use("/requests", requestsRoute);
app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);

app.use(errorHandler);

export default app;
export { storeStuff };
