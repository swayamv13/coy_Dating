"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatches = getMatches;
const matchService_1 = require("../services/matchService");
function getMatches(request, response) {
    const userId = response.locals.userId;
    const matches = (0, matchService_1.getMatchesForUser)(userId);
    response.json({
        success: true,
        matches,
    });
}
