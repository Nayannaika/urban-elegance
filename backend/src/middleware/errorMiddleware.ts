import express, { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse.js";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const stack = process.env.NODE_ENV === "production" ? null : err.stack;

  sendError(res, statusCode, err.message, stack);
};

export { notFound, errorHandler };
