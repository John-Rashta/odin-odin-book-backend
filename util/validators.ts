import { body, param, query } from "express-validator";
import { isAlphanumeric, isUUID } from "validator";

const validateCredentials = [
    body("username")
        .isAlphanumeric()
        .withMessage("Only letters and or numbers.")
        .trim(),
    body("password")
    .isAscii()
    .withMessage("Must be only Ascii characters.")
    .trim(),
];

const validateOptionalLogin = [
  body("username")
    .optional({ values: "falsy" })
    .isAlphanumeric()
    .withMessage("Only letters and or numbers."),
  body("password")
    .optional({ values: "falsy" })
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

  const validateRequest = [
    body("id")
      .isUUID()
      .withMessage("Must be an UUID."),
    body("type")
      .isIn(["FOLLOW"])
      .withMessage("Must be a valid type."),
  ];

  const validateSearch = [
    query("user")
    .custom((value) => {
      return isUUID(value) || isAlphanumeric(value);
    }),
  ];

  const validatePost = [
    body("content")
    .optional({values: "falsy"})
    .notEmpty()
    .isString()
    .trim()
  ];

  const validateLikeType = [
    body("action")
      .isIn(["ADD", "REMOVE"])
      .withMessage("Must be a valid action."),
  ];

  const validateCommentQuery =  [
    query("comment")
      .optional({values: "falsy"})
      .isUUID()
      .withMessage("Must be an UUID.")
  ];

  const validateUpdateContent = [
    body("content")
      .notEmpty()
      .isString()
      .withMessage("Can't be empty and must be text.")
      .trim()
  ];

  const validateDataQuery = [
    query("amount")
      .optional({values: "falsy"})
      .isInt()
      .withMessage("Must be an integer."),
    query("skip")
      .optional({values: "falsy"})
      .isInt()
      .withMessage("Must be an integer.")
  ]

export {
    validateCredentials,
    validateUUID,
    validateOptionalCredentials,
    validateUserProfile,
    validateRequest,
    validateSearch,
    validatePost,
    validateLikeType,
    validateCommentQuery,
    validateUpdateContent,
    validateDataQuery,
    validateOptionalLogin,
};