import { Router } from "express";
import { getDiscover } from "../controllers/discoverController";
import { testUserMiddleware } from "../middleware/testUser";

export const discoverRouter = Router();

discoverRouter.get("/discover", testUserMiddleware, getDiscover);
