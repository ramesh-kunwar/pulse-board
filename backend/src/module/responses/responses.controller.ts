import { Request, Response } from "express";
import * as responsesService from "./responses.service.js";
import ApiResponse from "../../common/utils/api-response.js";
export const submitResponseHandler = async (req: Request, res: Response) => {
  const pollId = req.params.pollId as string;
  const userId = req.user?.id;

  const answers = req.body.answers;

  await responsesService.submitResponse(pollId, userId, answers);

  ApiResponse.created(res, "Response Submitted Successfully");
};
