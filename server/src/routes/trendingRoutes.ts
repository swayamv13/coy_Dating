import { Router } from "express";
import { getTrendingInterests } from "../controllers/trendingController";
import { requireAuthentication } from "../middleware/auth";

export const trendingRouter = Router();

trendingRouter.get("/trending", requireAuthentication, getTrendingInterests);
