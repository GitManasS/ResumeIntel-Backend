import Joi from 'joi';

export const createJobSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().required(),
    company: Joi.string().required(),
    location: Joi.string().allow(''),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'remote'),
    description: Joi.string().required(),
    requirements: Joi.array().items(Joi.string()),
    skills: Joi.array().items(Joi.string()),
    salary: Joi.object({
      min: Joi.number(),
      max: Joi.number(),
      currency: Joi.string(),
    }),
    status: Joi.string().valid('draft', 'active', 'closed'),
  }),
});

export const applyJobSchema = Joi.object({
  body: Joi.object({
    resumeId: Joi.string().required(),
  }),
});
