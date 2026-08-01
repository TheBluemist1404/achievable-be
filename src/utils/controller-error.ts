import { Response } from "express";
import mongoose from "mongoose";

interface ControllerErrorMessages {
  badRequest?: string;
  internalServerError?: string;
}

const DEFAULT_MESSAGES: Required<ControllerErrorMessages> = {
  badRequest: "Invalid request data",
  internalServerError: "Internal server error",
};

export const sendControllerError = (
  error: unknown,
  res: Response,
  messages: ControllerErrorMessages = {},
): void => {
  console.error(error);

  if (
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.CastError
  ) {
    res.status(400).json({
      message: messages.badRequest ?? DEFAULT_MESSAGES.badRequest,
    });
    return;
  }

  res.status(500).json({
    message:
      messages.internalServerError ?? DEFAULT_MESSAGES.internalServerError,
  });
};
