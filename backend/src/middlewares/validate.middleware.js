import { ApiError } from '../utils/ApiError.js';

/**
 * Request Validation Middleware
 * 
 * Why it exists: Validates the request body/params against a Zod schema before hitting the controller.
 * What it does: If validation fails, it throws a 400 error. If it succeeds, it proceeds to the controller.
 */
export const validate = (schema) => async (req, res, next) => {
  try {
    // Parse and override the request body with the validated/transformed data
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    // Zod throws an error object. We extract the messages and pass it to the error handler.
    const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    next(new ApiError(400, message));
  }
};
