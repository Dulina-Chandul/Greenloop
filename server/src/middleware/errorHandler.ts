import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import z from "zod";
import AppError from "../utils/AppError";

const handleZodError = (res: Response, err: z.ZodError) => {
  const errors = err.issues.map((error) => ({
    path: error.path.join("."),
    message: error.message,
  }));

  return res.status(BAD_REQUEST).json({
    status: "error",
    message: err.message,
    errors,
  });
};

const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(`PATH : ${req.path}, ERROR : ${err}`);

  if (err instanceof z.ZodError) {
    return handleZodError(res, err);
  }

  if (err instanceof AppError) {
    return handleAppError(res, err);
  }

  return res.status(INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: `Internal Server Error ${err.message}`,
  });
};

export default errorHandler;
