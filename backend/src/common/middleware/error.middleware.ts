import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/api-error.js";
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";
  return res.status(500).json({
    success: false,
    message,
    errors: [],
  });
};
