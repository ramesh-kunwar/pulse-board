import express, { Router } from "express";
import { validateRequestBody } from "../../common/middleware/validate.middleware.js";
import {
  isAuthenticated,
  optionalAuth,
} from "../../common/middleware/auth.middleware.js";
import { createPollSchema } from "./dto/create-poll.dto.js";
import * as pollsController from "./polls.controller.js";
import responsesRouter from "../responses/responses.routes.js";
const pollsRouter: Router = express.Router();

pollsRouter.post(
  "/",
  isAuthenticated,
  validateRequestBody(createPollSchema),
  pollsController.createPollHandler
);
pollsRouter.get("/", isAuthenticated, pollsController.getPollsHandler);
pollsRouter.get("/:id", optionalAuth, pollsController.getPollByIdHandler);
pollsRouter.delete("/:id", isAuthenticated, pollsController.deletePollHandler);

pollsRouter.post(
  "/:id/publish",
  isAuthenticated,
  pollsController.publishPollHandler
);

pollsRouter.post(
  "/:id/close",
  isAuthenticated,
  pollsController.closePollHandler
);

// response router
pollsRouter.use("/", responsesRouter);
export default pollsRouter;
