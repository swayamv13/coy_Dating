import type { Request, Response } from "express";
import { getTrending } from "../services/trendingService";

export function getTrendingInterests(_request: Request, response: Response): void {
  response.json({ success: true, ...getTrending() });
}
