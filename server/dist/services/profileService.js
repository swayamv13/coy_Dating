"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.updateProfilePhoto = updateProfilePhoto;
const connection_1 = require("../database/connection");
function getProfile(userId) {
    const row = connection_1.db.prepare(`
    SELECT u.id, u.name, p.age, p.gender, p.looking_for, p.location,
           p.bio, p.photo_url, p.photo_caption, p.interests
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE u.id = ?
  `).get(userId);
    if (!row)
        return null;
    return {
        id: row.id,
        name: row.name,
        age: row.age,
        gender: row.gender,
        lookingFor: JSON.parse(row.looking_for),
        location: row.location,
        bio: row.bio,
        photoUrl: row.photo_url,
        photoCaption: row.photo_caption,
        interests: JSON.parse(row.interests),
    };
}
function updateProfile(userId, update) {
    const transaction = connection_1.db.transaction(() => {
        connection_1.db.prepare("UPDATE users SET name = ? WHERE id = ?").run(update.name, userId);
        connection_1.db.prepare(`
      UPDATE profiles
      SET age = ?, gender = ?, looking_for = ?, location = ?, bio = ?,
          photo_caption = ?, interests = ?
      WHERE user_id = ?
    `).run(update.age, update.gender, JSON.stringify(update.lookingFor), update.location, update.bio, update.photoCaption, JSON.stringify(update.interests), userId);
    });
    transaction();
    return getProfile(userId);
}
function updateProfilePhoto(userId, photoUrl) {
    connection_1.db.prepare("UPDATE profiles SET photo_url = ? WHERE user_id = ?").run(photoUrl, userId);
    return getProfile(userId);
}
