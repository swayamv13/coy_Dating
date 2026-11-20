"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesRouter = void 0;
const express_1 = require("express");
const matchesController_1 = require("../controllers/matchesController");
const auth_1 = require("../middleware/auth");
exports.matchesRouter = (0, express_1.Router)();
exports.matchesRouter.get("/matches", auth_1.requireAuthentication, matchesController_1.getMatches);
