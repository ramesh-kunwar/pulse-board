import express, { Router } from "express";
import { validateRequestBody } from "../../common/middleware/validate.middleware.js";
import { isAuthenticated } from "../../common/middleware/auth.middleware.js";
import { createPollSchema } from "./dto/create-poll.dto.js";
import * as pollsController from "./polls.controller.js";
const pollsRouter: Router = express.Router();

pollsRouter.post(
  "/",
  isAuthenticated,
  validateRequestBody(createPollSchema),
  pollsController.createPollHandler
);
pollsRouter.get("/", isAuthenticated, pollsController.getPollsHandler);
pollsRouter.get("/:id", pollsController.getPollHandler);
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
export default pollsRouter;
