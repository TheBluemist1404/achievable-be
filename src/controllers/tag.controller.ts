import { CreateTagDto } from "@/dtos/tag.dto";
import * as tagService from "@/services/tag.service";
import { sendControllerError } from "@/utils/controller-error";
import { Request, Response } from "express";

type EmptyParams = Record<string, never>;

// GET /api/v1/tag
export const getTags = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const tags = await tagService.getTags(req.auth!.userId);

    if (!tags) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ tags });
  } catch (error: unknown) {
    sendControllerError(error, res, {
      internalServerError: "Failed to retrieve tags",
    });
  }
};

// POST /api/v1/tag
export const createTag = async (
  req: Request<EmptyParams, unknown, CreateTagDto>,
  res: Response,
): Promise<void> => {
  try {
    const result = await tagService.createTag(
      req.auth!.userId,
      req.body.name,
    );

    if (!result) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(result);
  } catch (error: unknown) {
    sendControllerError(error, res, {
      badRequest: "Invalid tag data",
      internalServerError: "Failed to create tag",
    });
  }
};
