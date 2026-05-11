import { Request, Response } from "express";
import * as pollsService from "./polls.service.js";
import ApiResponse from "../../common/utils/api-response.js";
export const createPollHandler = async (req: Request, res: Response) => {
  const poll = await pollsService.createPoll(req.body, req.user.id);
  ApiResponse.created(res, "Poll Created Successfully", poll);
};
export const getPollsHandler = async (req: Request, res: Response) => {
  const polls = await pollsService.getPolls(req.user.id);
  ApiResponse.ok(res, "Polls Retrieved Successfully", polls);
};
export const getPollHandler = async (req: Request, res: Response) => {
  const polls = await pollsService.getPolls(req.user.id);
  ApiResponse.ok(res, "Polls Retrieved Successfully", polls);
};
export const deletePollHandler = async (req: Request, res: Response) => {};
export const closePollHandler = async (req: Request, res: Response) => {};
export const publishPollHandler = async (req: Request, res: Response) => {};
