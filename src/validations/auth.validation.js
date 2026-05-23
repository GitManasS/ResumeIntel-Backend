import Joi from 'joi';

// Allow .demo / local TLDs used in seed accounts (Joi blocks unknown TLDs by default)
const emailField = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .trim();

export const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: emailField.required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('candidate', 'recruiter').default('candidate'),
  }),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: emailField.required(),
    password: Joi.string().required(),
  }),
});

export const refreshSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
});

export const forgotPasswordSchema = Joi.object({
  body: Joi.object({
    email: emailField.required(),
  }),
});

export const resetPasswordSchema = Joi.object({
  body: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),
});
