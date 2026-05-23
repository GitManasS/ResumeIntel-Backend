import Joi from 'joi';

export const jdMatchSchema = Joi.object({
  body: Joi.object({
    resumeId: Joi.string().required(),
    jobDescription: Joi.string().min(50).required(),
    jobTitle: Joi.string().allow(''),
  }),
});

export const interviewSchema = Joi.object({
  body: Joi.object({
    resumeId: Joi.string(),
    targetRole: Joi.string().required(),
    skills: Joi.array().items(Joi.string()),
  }),
});

export const reanalyzeSchema = Joi.object({
  body: Joi.object({
    targetRole: Joi.string().allow(''),
  }),
});
