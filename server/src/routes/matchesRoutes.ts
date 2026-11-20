import { Router } from "express";
import { getMatches } from "../controllers/matchesController";
import { testUserMiddleware } from "../middleware/testUser";

export const matchesRouter = Router();

matchesRouter.get("/matches", testUserMiddleware, getMatches);
