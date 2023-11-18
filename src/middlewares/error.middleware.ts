import { NextFunction, Request, Response } from "express";
import { HttpException } from "@exceptions/HttpException";
import { logger } from "@utils/logger";

export const ErrorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  console.log(error)
  try {
    const status: number = error.status || 500;
    const message: string = error.message || "Something went wrong";
    const errors: string[] = error.errors || [];
    // const success: boolean = error.success || false;

    if(message.endsWith("does not exist")) {
      logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
      res.status(400).json({ code: 400, status: "BAD REQUEST", message: "Invalid Property", errors });
    } else if(message.startsWith("invalid input syntax for")) {
      logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
      res.status(400).json({ code: 400, status: "BAD REQUEST", message: "Invalid UUID", errors });
    } else {
      logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
      res.status(status).json({ code: status, status: "BAD REQUEST", message, errors });
    }
  } catch (error) {
    next(error);
  }
};