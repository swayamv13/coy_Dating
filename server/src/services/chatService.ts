import { db } from "../database/connection";

export interface ChatMessage {
  id: number;
  senderUserId: number;
  body: string;
  createdAt: string;
}

interface MessageRow {
  id: number;
  sender_user_id: number;
  body: string;
  created_at: string;
}

export class MatchAccessError extends Error {}

function assertMatchParticipant(matchId: number, userId: number): void {
  const match = db.prepare(`
    SELECT id FROM matches
    WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)
  `).get(matchId, userId, userId);

  if (!match) {
    throw new MatchAccessError("This conversation is not available.");
  }
}

function mapMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    senderUserId: row.sender_user_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export function getMessages(
  matchId: number,
  userId: number,
  afterId?: number,
): ChatMessage[] {
  assertMatchParticipant(matchId, userId);

  if (afterId !== undefined) {
    const rows = db.prepare(`
      SELECT id, sender_user_id, body, created_at
      FROM messages
      WHERE match_id = ? AND id > ?
      ORDER BY id ASC
      LIMIT 100
    `).all(matchId, afterId) as MessageRow[];
    return rows.map(mapMessage);
  }

  const rows = db.prepare(`
    SELECT id, sender_user_id, body, created_at
    FROM (
      SELECT id, sender_user_id, body, created_at
      FROM messages
      WHERE match_id = ?
      ORDER BY id DESC
      LIMIT 100
    )
    ORDER BY id ASC
  `).all(matchId) as MessageRow[];
  return rows.map(mapMessage);
}

export function sendMessage(matchId: number, userId: number, body: string): ChatMessage {
  assertMatchParticipant(matchId, userId);
  const result = db.prepare(`
    INSERT INTO messages (match_id, sender_user_id, body)
    VALUES (?, ?, ?)
  `).run(matchId, userId, body);
  const row = db.prepare(`
    SELECT id, sender_user_id, body, created_at
    FROM messages WHERE id = ?
  `).get(Number(result.lastInsertRowid)) as MessageRow;
  return mapMessage(row);
}
