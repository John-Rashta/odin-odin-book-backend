import { Handler } from "express";

const isAuth: Handler = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json();
    return;
  }
};

export { isAuth };
