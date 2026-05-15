import { NextFunction, Request, Response } from "express";
import ApiResponse from "../../common/utils/api-response.js";
import * as authService from "./auth.service.js";
import SERVER_CONFIG from "../../common/config/serverConfig.js";
import ApiError from "../../common/utils/api-error.js";
export const registerHandler = async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, "User Registered Successfully", user);
};

export const loginHandler = async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: SERVER_CONFIG.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: SERVER_CONFIG.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse.ok(res, "Login Successful", {
    id: user.id,
    firstName: user.firstName,
    email: user.email,
  });
};

export const getMeHandler = async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user.id);
  return ApiResponse.ok(res, "User Fetched Successfully", user);
};

export const refreshHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return next(ApiError.unauthorized("Refresh token missign."));
  }
  const user = await authService.refresh(refreshToken);

  res.cookie("accessToken", user.accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: SERVER_CONFIG.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", user.newRefreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: SERVER_CONFIG.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return ApiResponse.ok(res, "Access and refres token regenerated", {
    id: user.user.id,
    email: user.user.email,
  });
};

export const logoutHandler = async (req: Request, res: Response) => {
  await authService.logout(req.user.id);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return ApiResponse.ok(res, "Logged out successfully.", {});
};
