"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidUserError = exports.DuplicateSwipeError = void 0;
exports.recordSwipe = recordSwipe;
const connection_1 = require("../database/connection");
class DuplicateSwipeError extends Error {
}
exports.DuplicateSwipeError = DuplicateSwipeError;
class InvalidUserError extends Error {
}
exports.InvalidUserError = InvalidUserError;
function recordSwipe(swiperUserId, targetUserId, action) {
    if (swiperUserId === targetUserId) {
        throw new InvalidUserError("A user cannot swipe on their own profile.");
    }
    const targetUser = connection_1.db.prepare("SELECT id FROM users WHERE id = ?").get(targetUserId);
    if (!targetUser) {
        throw new InvalidUserError("Target profile not found.");
    }
    const duplicate = connection_1.db.prepare(`
    SELECT id FROM swipes
    WHERE swiper_user_id = ? AND target_user_id = ?
  `).get(swiperUserId, targetUserId);
    if (duplicate) {
        throw new DuplicateSwipeError("This profile has already been swiped on.");
    }
    const transaction = connection_1.db.transaction(() => {
        connection_1.db.prepare(`
      INSERT INTO swipes (swiper_user_id, target_user_id, action)
      VALUES (?, ?, ?)
    `).run(swiperUserId, targetUserId, action);
        if (action === "pass") {
            return { mutualMatchCreated: false, matchId: null };
        }
        const reverseLike = connection_1.db.prepare(`
      SELECT id FROM swipes
      WHERE swiper_user_id = ? AND target_user_id = ? AND action = 'like'
    `).get(targetUserId, swiperUserId);
        if (!reverseLike) {
            return { mutualMatchCreated: false, matchId: null };
        }
        const userOneId = Math.min(swiperUserId, targetUserId);
        const userTwoId = Math.max(swiperUserId, targetUserId);
        const result = connection_1.db.prepare(`
      INSERT OR IGNORE INTO matches (user_one_id, user_two_id)
      VALUES (?, ?)
    `).run(userOneId, userTwoId);
        return {
            mutualMatchCreated: true,
            matchId: Number(result.lastInsertRowid),
        };
    });
    const match = transaction();
    return {
        swiped: true,
        action,
        targetUserId,
        mutualMatchCreated: match.mutualMatchCreated,
        matchId: match.matchId,
    };
}
