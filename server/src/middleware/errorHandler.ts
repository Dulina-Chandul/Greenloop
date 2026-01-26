import { ErrorRequestHandler } from "express";
import { INTERNAL_SERVER_ERROR } from "../constants/http";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(`PATH : ${req.path}, ERROR : ${err}`);
  res.status(INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: `Internal Server Error ${err.message}`,
  });
};

export default errorHandler;
