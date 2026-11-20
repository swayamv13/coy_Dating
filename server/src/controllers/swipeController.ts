import type { Request, Response } from "express";
import { z } from "zod";
import {
  DuplicateSwipeError,
  InvalidUserError,
  recordSwipe,
} from "../services/swipeService";

const swipeSchema = z.object({
  targetUserId: z.number().int().positive(),
  action: z.enum(["like", "pass"]),
});

export function postSwipe(request: Request, response: Response): void {
  const parsed = swipeSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      success: false,
      error: "Request must include targetUserId and action ('like' or 'pass').",
      details: parsed.error.flatten(),
    });
    return;
  }

  const swiperUserId = response.locals.testUserId as number;

  try {
    const result = recordSwipe(
      swiperUserId,
      parsed.data.targetUserId,
      parsed.data.action,
    );
    response.status(parsed.data.action === "like" && result.mutualMatchCreated ? 201 : 200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof DuplicateSwipeError) {
      response.status(409).json({
        success: false,
        error: error.message,
      });
      return;
    }

    if (error instanceof InvalidUserError) {
      response.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    throw error;
  }
}
