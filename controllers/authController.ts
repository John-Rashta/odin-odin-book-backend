import asyncHandler from "express-async-handler";
import { matchedData } from "express-validator";
import { getUserByNameForSession, createUser } from "../util/queries";
import bcrypt from "bcryptjs";

const signupUser = asyncHandler(async (req, res) => {
    const formData = matchedData(req);
    const invalidUser = await getUserByNameForSession(formData.username);
    if (invalidUser) {
        res.status(400).json({message: "Unavailable Username"});
        return;
    };

    bcrypt.hash(formData.password, 10, async (err, hashedPassword) => {
        if (err) {
            console.log(err);
            res.status(500).json({message: "Internal Error"});
            return;
        };

        await createUser(formData.username, hashedPassword, new Date());
        res.status(200).json();
        return;
    });

    return;
});

const loginUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(400).json();
        return;
    };

    res.status(200).json({id: req.user.id});
    return;
});

const logoutUser = asyncHandler(async (req, res, next) => {
    if (req.user) {
        res.status(400).json();
        return;
    };

    req.logout((err) => {
        if (err)  {
            next(err);
            return;
        };
        res.status(200).json();
        return;
    });
});


export {
    signupUser,
    loginUser,
    logoutUser,
};