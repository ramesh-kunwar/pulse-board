import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import SERVER_CONFIG from "../config/serverConfig.js";
/**
 * auth middleware
 
- extract token from cookies 
    - req.cookies or from bearer
    - 


 */

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies["accessToken"] || req.headers.authorization?.split(" ")[1];

  try {
    if (!token) {
      return next(
        ApiError.unauthorized("User Unauthorized to access this route")
      );
    }

    const decoded = jwt.verify(token, SERVER_CONFIG.JWT_ACCESS_SECRET);
    req.user = decoded as { id: string };

    next();
  } catch (error) {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies["accessToken"] || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(); // no token — just continue, don't block
  }

  try {
    const decoded = jwt.verify(token, SERVER_CONFIG.JWT_ACCESS_SECRET);
    req.user = decoded as { id: string };
    next();
  } catch (error) {
    next(); // invalid token — still continue, just don't set req.user
  }
};
