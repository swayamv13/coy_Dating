"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swipeRouter = void 0;
const express_1 = require("express");
const swipeController_1 = require("../controllers/swipeController");
const auth_1 = require("../middleware/auth");
exports.swipeRouter = (0, express_1.Router)();
exports.swipeRouter.post("/swipes", auth_1.requireAuthentication, swipeController_1.postSwipe);
exports.swipeRouter.post("/swipe", auth_1.requireAuthentication, swipeController_1.postSwipe);
