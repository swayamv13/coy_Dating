import type { Request, Response } from "express";
import { z } from "zod";
import { MatchAccessError, getMessages, sendMessage } from "../services/chatService";

const paramsSchema = z.object({
  matchId: z.coerce.number().int().positive(),
});
const querySchema = z.object({
  after: z.coerce.number().int().nonnegative().optional(),
});
const messageSchema = z.object({
  body: z.string().trim().min(1).max(1000),
});

export function getConversation(request: Request, response: Response): void {
  const params = paramsSchema.safeParse(request.params);
  const query = querySchema.safeParse(request.query);
  if (!params.success || !query.success) {
    response.status(400).json({ success: false, error: "Invalid conversation request." });
    return;
  }

  try {
    const messages = getMessages(
      params.data.matchId,
      response.locals.userId as number,
      query.data.after,
    );
    response.json({ success: true, messages });
  } catch (error) {
    if (error instanceof MatchAccessError) {
      response.status(404).json({ success: false, error: error.message });
      return;
    }
    throw error;
  }
}

export function postConversationMessage(request: Request, response: Response): void {
  const params = paramsSchema.safeParse(request.params);
  const parsed = messageSchema.safeParse(request.body);
  if (!params.success || !parsed.success) {
    response.status(400).json({
      success: false,
      error: "A message must contain between 1 and 1000 characters.",
      details: parsed.success ? undefined : parsed.error.flatten(),
    });
    return;
  }

  try {
    const message = sendMessage(
      params.data.matchId,
      response.locals.userId as number,
      parsed.data.body,
    );
    response.status(201).json({ success: true, message });
  } catch (error) {
    if (error instanceof MatchAccessError) {
      response.status(404).json({ success: false, error: error.message });
      return;
    }
    throw error;
  }
}
