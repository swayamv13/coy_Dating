"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverRouter = void 0;
const express_1 = require("express");
const discoverController_1 = require("../controllers/discoverController");
const auth_1 = require("../middleware/auth");
exports.discoverRouter = (0, express_1.Router)();
exports.discoverRouter.get("/discover", auth_1.requireAuthentication, discoverController_1.getDiscover);
