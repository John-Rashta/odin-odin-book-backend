import { body, param } from "express-validator";

const validateCredentials = [
    body("username")
        .isAlphanumeric()
        .withMessage("Only letters and or numbers."),
    body("password")
    .isAscii()
    .withMessage("Must be only Ascii characters."),
];


const validateUUID = (fieldname: string) => {
    return [param(fieldname).isUUID().withMessage("Must be an UUID")];
  };

  const validateOptionalCredentials = [
    body("username")
      .trim()
      .optional({ values: "falsy" })
      .isAlphanumeric()
      .withMessage("Must only contain letters and/or numbers."),
    body("password")
      .optional({ values: "falsy" })
      .isAscii()
      .withMessage("Must be only Ascii characters."),
    body("oldPassword")
      .optional({ values: "falsy" })
      .isAscii()
      .withMessage("Must be only Ascii characters."),
  ];

  const validateUserProfile = [
    body("icon")
      .optional({ values: "falsy" })
      .isInt()
      .withMessage("Must be an integer")
      .toInt(),
    body("aboutMe").optional().isString(),
  ];

export {
    validateCredentials,
    validateUUID,
    validateOptionalCredentials,
    validateUserProfile,
};