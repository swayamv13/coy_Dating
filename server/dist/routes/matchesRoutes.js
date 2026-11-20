"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesRouter = void 0;
const express_1 = require("express");
const matchesController_1 = require("../controllers/matchesController");
const testUser_1 = require("../middleware/testUser");
exports.matchesRouter = (0, express_1.Router)();
exports.matchesRouter.get("/matches", testUser_1.testUserMiddleware, matchesController_1.getMatches);
