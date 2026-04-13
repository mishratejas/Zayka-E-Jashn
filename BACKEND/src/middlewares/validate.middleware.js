import { ApiError } from "../utils/helpers.js";

/**
 * Middleware factory: validates req.body against a Zod schema.
 * Usage: router.post("/register", validate(registerSchema), controller)
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
    return next(new ApiError(422, "Validation failed", errors));
  }
  req.body = result.data; // use parsed + coerced data
  next();
};
