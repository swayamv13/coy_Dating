"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatchesForUser = getMatchesForUser;
const connection_1 = require("../database/connection");
function getMatchesForUser(userId) {
    const rows = connection_1.db.prepare(`
    SELECT
      u.id,
      u.name,
      p.age,
      p.photo_url,
      p.location,
      p.bio,
      p.interests,
      m.created_at AS matched_at
    FROM matches m
    JOIN users u ON u.id = CASE
      WHEN m.user_one_id = ? THEN m.user_two_id
      WHEN m.user_two_id = ? THEN m.user_one_id
      ELSE -1
    END
    JOIN profiles p ON p.user_id = u.id
    WHERE m.user_one_id = ? OR m.user_two_id = ?
    ORDER BY m.created_at DESC
  `).all(userId, userId, userId, userId);
    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        age: row.age,
        photo: row.photo_url,
        city: row.location,
        bio: row.bio,
        interests: JSON.parse(row.interests),
        matchedAt: row.matched_at,
    }));
}
