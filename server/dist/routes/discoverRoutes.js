"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverRouter = void 0;
const express_1 = require("express");
const discoverController_1 = require("../controllers/discoverController");
const testUser_1 = require("../middleware/testUser");
exports.discoverRouter = (0, express_1.Router)();
exports.discoverRouter.get("/discover", testUser_1.testUserMiddleware, discoverController_1.getDiscover);
