import { Router } from "express";
import { getMatches } from "../controllers/matchesController";
import { requireAuthentication } from "../middleware/auth";

export const matchesRouter = Router();

matchesRouter.get("/matches", requireAuthentication, getMatches);
