"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchAccessError = void 0;
exports.getMessages = getMessages;
exports.sendMessage = sendMessage;
const connection_1 = require("../database/connection");
class MatchAccessError extends Error {
}
exports.MatchAccessError = MatchAccessError;
function assertMatchParticipant(matchId, userId) {
    const match = connection_1.db.prepare(`
    SELECT id FROM matches
    WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)
  `).get(matchId, userId, userId);
    if (!match) {
        throw new MatchAccessError("This conversation is not available.");
    }
}
function mapMessage(row) {
    return {
        id: row.id,
        senderUserId: row.sender_user_id,
        body: row.body,
        createdAt: row.created_at,
    };
}
function getMessages(matchId, userId, afterId) {
    assertMatchParticipant(matchId, userId);
    if (afterId !== undefined) {
        const rows = connection_1.db.prepare(`
      SELECT id, sender_user_id, body, created_at
      FROM messages
      WHERE match_id = ? AND id > ?
      ORDER BY id ASC
      LIMIT 100
    `).all(matchId, afterId);
        return rows.map(mapMessage);
    }
    const rows = connection_1.db.prepare(`
    SELECT id, sender_user_id, body, created_at
    FROM (
      SELECT id, sender_user_id, body, created_at
      FROM messages
      WHERE match_id = ?
      ORDER BY id DESC
      LIMIT 100
    )
    ORDER BY id ASC
  `).all(matchId);
    return rows.map(mapMessage);
}
function sendMessage(matchId, userId, body) {
    assertMatchParticipant(matchId, userId);
    const result = connection_1.db.prepare(`
    INSERT INTO messages (match_id, sender_user_id, body)
    VALUES (?, ?, ?)
  `).run(matchId, userId, body);
    const row = connection_1.db.prepare(`
    SELECT id, sender_user_id, body, created_at
    FROM messages WHERE id = ?
  `).get(Number(result.lastInsertRowid));
    return mapMessage(row);
}
