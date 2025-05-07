import { body, param, query } from "express-validator";

const validateCredentials = [
    body("username")
        .isAlphanumeric()
        .withMessage("Only letters and or numbers."),
    body("password")
    .isAscii()
    .withMessage("Must be only Ascii characters."),
];

export {
    validateCredentials,
};