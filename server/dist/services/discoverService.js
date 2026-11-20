"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscoverProfiles = getDiscoverProfiles;
const connection_1 = require("../database/connection");
const discoverFilter = `
  u.id != ?
  AND u.email != 'test.user@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM swipes s
    WHERE s.swiper_user_id = ? AND s.target_user_id = u.id
  )
  AND EXISTS (
    SELECT 1 FROM profiles viewer
    WHERE viewer.user_id = ?
      AND EXISTS (
        SELECT 1 FROM json_each(viewer.looking_for) preference
        WHERE preference.value = 'Everyone'
          OR preference.value = CASE p.gender
            WHEN 'Man' THEN 'Men'
            WHEN 'Woman' THEN 'Women'
            WHEN 'Non-binary' THEN 'Non-binary'
            ELSE 'Self-describe'
          END
      )
      AND EXISTS (
        SELECT 1 FROM json_each(p.looking_for) preference
        WHERE preference.value = 'Everyone'
          OR preference.value = CASE viewer.gender
            WHEN 'Man' THEN 'Men'
            WHEN 'Woman' THEN 'Women'
            WHEN 'Non-binary' THEN 'Non-binary'
            ELSE 'Self-describe'
          END
      )
  )
`;
function getDiscoverProfiles(currentUserId, limit, offset) {
    const rows = connection_1.db.prepare(`
    SELECT u.id, u.name, p.age, p.gender, p.photo_caption, p.bio,
           p.location, p.photo_url, p.interests
    FROM users u
    INNER JOIN profiles p ON p.user_id = u.id
    WHERE ${discoverFilter}
    ORDER BY u.id DESC
    LIMIT ? OFFSET ?
  `).all(currentUserId, currentUserId, currentUserId, limit, offset);
    const countRow = connection_1.db.prepare(`
    SELECT COUNT(*) AS total
    FROM users u
    INNER JOIN profiles p ON p.user_id = u.id
    WHERE ${discoverFilter}
  `).get(currentUserId, currentUserId, currentUserId);
    const profiles = rows.map((row) => ({
        id: row.id,
        name: row.name,
        age: row.age,
        gender: row.gender,
        photoCaption: row.photo_caption,
        bio: row.bio,
        location: row.location,
        photoUrl: row.photo_url,
        interests: JSON.parse(row.interests),
    }));
    return { profiles, total: countRow.total };
}
