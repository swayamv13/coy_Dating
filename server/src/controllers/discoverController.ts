import type { Request, Response } from "express";
import { z } from "zod";
import { getDiscoverProfiles } from "../services/discoverService";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export function getDiscover(request: Request, response: Response): void {
  const parsed = querySchema.safeParse(request.query);
  if (!parsed.success) {
    response.status(400).json({
      success: false,
      error: "Invalid pagination parameters.",
      details: parsed.error.flatten(),
    });
    return;
  }

  const currentUserId = response.locals.userId as number;
  const { limit, offset } = parsed.data;
  const result = getDiscoverProfiles(currentUserId, limit, offset);

  response.json({
    success: true,
    profiles: result.profiles,
    pagination: {
      limit,
      offset,
      total: result.total,
      hasMore: offset + result.profiles.length < result.total,
    },
  });
}
