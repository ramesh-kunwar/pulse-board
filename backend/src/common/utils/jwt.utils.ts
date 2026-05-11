import crypto from "crypto";
import jwt from "jsonwebtoken";
import SERVER_CONFIG from "../config/serverConfig.js";
export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, hashedToken };
};

export const generateAccessToken = (
  payload: string | Record<string, unknown>,
) => {
  return jwt.sign(payload, SERVER_CONFIG.JWT_ACCESS_SECRET, {
    expiresIn: SERVER_CONFIG.JWT_ACCESS_EXPIRES_IN as any,
  });
};

export const verifyAccesstoken = (token: string) => {
  return jwt.verify(token, SERVER_CONFIG.JWT_ACCESS_SECRET) as { id: string };
};

export const generateRefreshToken = (
  payload: string | Record<string, unknown>,
) => {
  return jwt.sign(payload, SERVER_CONFIG.JWT_REFRESH_SECRET, {
    expiresIn: SERVER_CONFIG.JWT_REFRESH_EXPIRES_IN as any,
  });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, SERVER_CONFIG.JWT_REFRESH_SECRET) as { id: string };
};
