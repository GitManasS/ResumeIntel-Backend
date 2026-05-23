import Joi from 'joi';

const emailField = Joi.string().email({ tlds: { allow: false } }).lowercase().trim();

const brandingSchema = Joi.object({
  primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#3396fc'),
  tagline: Joi.string().max(200).allow(''),
  about: Joi.string().max(2000).allow(''),
});

export const createOrganizationSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    slug: Joi.string().min(2).max(60).lowercase().pattern(/^[a-z0-9-]+$/).optional(),
    industry: Joi.string().max(80).allow(''),
    size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '500+').optional(),
    website: Joi.string().uri().allow('').optional(),
    branding: brandingSchema.optional(),
  }),
});

export const updateOrganizationSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(120),
    industry: Joi.string().max(80).allow(''),
    size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '500+'),
    website: Joi.string().uri().allow(''),
    isActive: Joi.boolean(),
    branding: brandingSchema,
  }).min(1),
  params: Joi.object({
    orgId: Joi.string().hex().length(24).required(),
  }),
});

export const createOrgMemberSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: emailField.required(),
    password: Joi.string().min(8).required(),
    orgRole: Joi.string()
      .valid('org_admin', 'hr_manager', 'recruiter', 'interviewer')
      .required(),
    title: Joi.string().max(100).allow(''),
  }),
  params: Joi.object({
    orgId: Joi.string().hex().length(24).required(),
  }),
});

export const updateOrgMemberSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100),
    orgRole: Joi.string().valid('org_admin', 'hr_manager', 'recruiter', 'interviewer'),
    title: Joi.string().max(100).allow(''),
    isActive: Joi.boolean(),
    password: Joi.string().min(8),
  }).min(1),
  params: Joi.object({
    orgId: Joi.string().hex().length(24).required(),
    userId: Joi.string().hex().length(24).required(),
  }),
});
