import Joi from "joi";

const basicSchema = Joi.object({
    id: Joi.string()
        .required()
        .uuid(),
    comment: Joi.string()
            .optional()
            .valid("yes")
    
});
export {
    basicSchema
};