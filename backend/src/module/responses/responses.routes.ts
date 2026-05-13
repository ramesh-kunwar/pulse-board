import express, { Router } from "express";
import { validateRequestBody } from "../../common/middleware/validate.middleware.js";
import { submitResponseSchema } from "./dto/submit-response.dto.js";
import { optionalAuth } from "../../common/middleware/auth.middleware.js";
import * as responsesController from "./responses.controller.js";
const responsesRouter: Router = express.Router();

responsesRouter.post(
  "/:pollId/responses",
  optionalAuth,
  validateRequestBody(submitResponseSchema),
  responsesController.submitResponseHandler
);

export default responsesRouter;
