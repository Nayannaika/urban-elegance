import { Response } from "express";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const sendResponse = (
  res: Response,
  statusCode: number,
  data: any,
  message = "Success",
  meta?: PaginationMeta,
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errorDetails?: any,
) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errorDetails && { error: errorDetails }),
  });
};
