import { Request, Response, NextFunction } from "express";

import ApiError from "../utils/api-error.js";
import { ZodError, ZodType } from "zod";

export const validateRequestBody = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        // next(
        //   ApiError.badRequest(`Invalid Request body. Error: ${error.issues}`),
        // );
        next(ApiError.badRequest("Invalid request body", error.issues));
      } else {
        next(ApiError.badRequest(`Invalid Request body. Error: ${error}`));
      }
    }
  };
};

export const validateQueryParams = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);

      next();
    } catch (error: unknown) {
      next(ApiError.badRequest(`Invalid query params. Error: ${error}`));
    }
  };
};
