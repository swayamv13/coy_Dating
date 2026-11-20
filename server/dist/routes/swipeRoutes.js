"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swipeRouter = void 0;
const express_1 = require("express");
const swipeController_1 = require("../controllers/swipeController");
const testUser_1 = require("../middleware/testUser");
exports.swipeRouter = (0, express_1.Router)();
exports.swipeRouter.post("/swipes", testUser_1.testUserMiddleware, swipeController_1.postSwipe);
exports.swipeRouter.post("/swipe", testUser_1.testUserMiddleware, swipeController_1.postSwipe);
