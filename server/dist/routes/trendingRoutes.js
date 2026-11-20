"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trendingRouter = void 0;
const express_1 = require("express");
const trendingController_1 = require("../controllers/trendingController");
const auth_1 = require("../middleware/auth");
exports.trendingRouter = (0, express_1.Router)();
exports.trendingRouter.get("/trending", auth_1.requireAuthentication, trendingController_1.getTrendingInterests);
