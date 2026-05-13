import { Request, Response } from "express";
import * as pollsService from "./polls.service.js";
import ApiResponse from "../../common/utils/api-response.js";
import ApiError from "../../common/utils/api-error.js";
export const createPollHandler = async (req: Request, res: Response) => {
  const poll = await pollsService.createPoll(req.body, req.user.id);
  ApiResponse.created(res, "Poll Created Successfully", poll);
};
export const getPollsHandler = async (req: Request, res: Response) => {
  const polls = await pollsService.getPolls(req.user.id);
  ApiResponse.ok(res, "Polls Retrieved Successfully", polls);
};
export const getPollByIdHandler = async (req: Request, res: Response) => {
  const pollId = req?.params?.id as string;
  const userId = req.user?.id;
  console.log(userId, " from controller");
  const poll = await pollsService.getPollById(pollId, userId);

  ApiResponse.ok(res, "Poll Retrieved Successfully", poll);
};

export const closePollHandler = async (req: Request, res: Response) => {
  const pollId = req.params.id as string;
  const userId = req.user.id;
  const poll = await pollsService.closePoll(pollId, userId);

  ApiResponse.ok(res, "Poll Closed Successfully", poll);
};

export const deletePollHandler = async (req: Request, res: Response) => {
  const pollId = req.params.id as string;
  const userId = req.user.id;
  await pollsService.deletePoll(pollId, userId);

  ApiResponse.ok(res, "Poll Deleted Successfully");
};

export const publishPollHandler = async (req: Request, res: Response) => {
  const pollId = req.params.id as string;
  const userId = req.user.id;
  const poll = await pollsService.publishPoll(pollId, userId);

  ApiResponse.ok(res, "Poll Published Successfully", poll);
};
