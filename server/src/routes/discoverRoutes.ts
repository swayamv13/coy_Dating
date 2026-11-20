import { Router } from "express";
import { getDiscover } from "../controllers/discoverController";
import { requireAuthentication } from "../middleware/auth";

export const discoverRouter = Router();

discoverRouter.get("/discover", requireAuthentication, getDiscover);
