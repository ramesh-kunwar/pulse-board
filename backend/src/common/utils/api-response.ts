import { Response } from "express";
class ApiResponse {
  static ok(res: Response, message: string, data: unknown = null) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }
  static created(res: Response, message: string, data: unknown = null) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static updated(res: Response, message: string, data: unknown = null) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static deleted(res: Response, message: string) {
    return res.status(200).json({
      success: true,
      message,
      data: null,
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}

export default ApiResponse;
