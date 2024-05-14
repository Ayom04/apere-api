const Joi = require("joi");

const validateEmail = (data) => {
  const emailSchema = Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required()
      .messages({
        "string.empty": `"Email" cannot be an empty`,
        "any.required": `"Email" is a required field`,
      }),
  });
  return emailSchema.validate(data);
};

const validateResigterUser = (data) => {
  const registerSchema = Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required()
      .messages({
        "string.empty": `"Email" cannot be an empty`,
        "any.required": `"Email" is a required field`,
      }),
    password: Joi.string().required().messages({
      "string.empty": `"Password" cannot be empty`,
      "any.required": `"Password" is a required field`,
    }),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "string.empty": `"confirm Password" cannot be an empty`,
        "any.required": `"confirm Password" is a required field`,
      }),
    phone: Joi.string().required().messages({
      "string.empty": `"Phone" cannot be an empty`,
      "any.required": `"Phone" is a required field`,
    }),
    firstName: Joi.string().required().messages({
      "string.empty": `"First Name" cannot be an empty`,
      "any.required": `"First Name" is a required field`,
    }),
    lastName: Joi.string().required().messages({
      "string.empty": `"Last Name" cannot be an empty`,
      "any.required": `"Last Name" is a required field`,
    }),
  });
  return registerSchema.validate(data);
};

const validateLoginUser = (data) => {
  const loginSchema = Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required()
      .messages({
        "string.empty": `"Email" cannot be an empty`,
        "any.required": `"Email" is a required field`,
      }),
    password: Joi.string().required().messages({
      "string.empty": `"Password" cannot be empty`,
      "any.required": `"Password" is a required field`,
    }),
  });
  return loginSchema.validate(data);
};

const validateVerifyUser = (data) => {
  const userVerificationSchema = Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    otp: Joi.string().required(),
  });
  return userVerificationSchema.validate(data);
};

const validatePassword = (data) => {
  const passwordSchema = Joi.object({
    password: Joi.string().required().messages({
      "string.empty": `"Password" cannot be empty`,
      "any.required": `"Password" is a required field`,
    }),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "string.empty": `"confirm Password" cannot be an empty`,
        "any.required": `"confirm Password" is a required field`,
      }),
  });
  return passwordSchema.validate(data);
};
module.exports = {
  validateEmail,
  validateResigterUser,
  validateLoginUser,
  validateVerifyUser,
  validatePassword,
};
