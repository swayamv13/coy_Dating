"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingInterests = getTrendingInterests;
const trendingService_1 = require("../services/trendingService");
function getTrendingInterests(_request, response) {
    response.json({ success: true, ...(0, trendingService_1.getTrending)() });
}
