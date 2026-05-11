import express, { Router } from "express";
import { validateRequestBody } from "../../common/middleware/validate.middleware.js";
import { registerSchema } from "./dto/register.dto.js";
import * as authController from "./auth.controller.js";
import { loginSchema } from "./dto/login.dto.js";
import { isAuthenticated } from "../../common/middleware/auth.middleware.js";
const authRouter: Router = express.Router();

authRouter.post(
  "/sign-up",
  validateRequestBody(registerSchema),
  authController.registerHandler,
);

authRouter.post(
  "/sign-in",
  validateRequestBody(loginSchema),

  authController.loginHandler,
);

authRouter.get("/me", isAuthenticated, authController.getMeHandler);
authRouter.post("/logout", isAuthenticated, authController.logoutHandler);
authRouter.post("/refresh", authController.refreshHandler);
export default authRouter;
