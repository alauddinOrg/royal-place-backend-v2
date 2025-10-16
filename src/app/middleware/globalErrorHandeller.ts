import mongoose from "mongoose";
import multer from "multer";
import { AppError } from "../error/appError";
import { ErrorRequestHandler } from "express";
import { logger } from "../utils/logger";
import { envVariable } from "../config";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong!";
  let errorName = err.name || "Error";

  if (err instanceof AppError && err.isOperational) {
    // app-defined errors
  } else if (err.code === 11000) {
    statusCode = 409;
    errorName = "Conflict";
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for "${field}": "${err.keyValue[field]}"`;
  } else if (err instanceof multer.MulterError) {
    statusCode = 400;
    errorName = "MulterError";
    message = err.code === "LIMIT_FILE_SIZE"
      ? "File size too large. Max 5MB."
      : `Multer error: ${err.message}`;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    errorName = "ValidationError";
    const errors = Object.values(err.errors).map((e: any) => e.message);
    message = `Validation error: ${errors.join(", ")}`;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    errorName = "BadRequest";
    message = `Invalid ${err.path}: "${err.value}"`;
  } else {
    logger.error("🔥 Unexpected Error:", err);
    if (envVariable.NODE_ENV === "production") {
      message = "Internal Server Error";
    }
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    error: errorName,
    message,
    stack: envVariable.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default globalErrorHandler;