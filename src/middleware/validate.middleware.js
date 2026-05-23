import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(
    { body: req.body, query: req.query, params: req.params },
    { abortEarly: false, stripUnknown: true }
  );

  if (error) {
    const errors = error.details.map((d) => d.message);
    throw ApiError.badRequest('Validation failed', errors);
  }

  if (value.body) req.body = value.body;
  if (value.query) req.query = value.query;
  if (value.params) req.params = value.params;

  next();
};
