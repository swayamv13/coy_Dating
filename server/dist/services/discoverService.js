"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscoverProfiles = getDiscoverProfiles;
const connection_1 = require("../database/connection");
function getDiscoverProfiles(currentUserId, limit, offset) {
    const rows = connection_1.db.prepare(`
    SELECT u.id, u.name, p.age, p.gender, p.bio, p.location, p.photo_url, p.interests
    FROM users u
    INNER JOIN profiles p ON p.user_id = u.id
    WHERE u.id != ?
      AND NOT EXISTS (
        SELECT 1 FROM swipes s
        WHERE s.swiper_user_id = ? AND s.target_user_id = u.id
      )
    ORDER BY u.id ASC
    LIMIT ? OFFSET ?
  `).all(currentUserId, currentUserId, limit, offset);
    const countRow = connection_1.db.prepare(`
    SELECT COUNT(*) AS total
    FROM users u
    INNER JOIN profiles p ON p.user_id = u.id
    WHERE u.id != ?
      AND NOT EXISTS (
        SELECT 1 FROM swipes s
        WHERE s.swiper_user_id = ? AND s.target_user_id = u.id
      )
  `).get(currentUserId, currentUserId);
    const profiles = rows.map((row) => ({
        id: row.id,
        name: row.name,
        age: row.age,
        gender: row.gender,
        bio: row.bio,
        location: row.location,
        photoUrl: row.photo_url,
        interests: JSON.parse(row.interests),
    }));
    return { profiles, total: countRow.total };
}
