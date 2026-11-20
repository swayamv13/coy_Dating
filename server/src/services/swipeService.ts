import { db } from "../database/connection";

export type SwipeAction = "like" | "pass";

export interface SwipeResult {
  swiped: true;
  action: SwipeAction;
  targetUserId: number;
  mutualMatchCreated: boolean;
  matchId: number | null;
}

export class DuplicateSwipeError extends Error {}
export class InvalidUserError extends Error {}

export function recordSwipe(
  swiperUserId: number,
  targetUserId: number,
  action: SwipeAction,
): SwipeResult {
  if (swiperUserId === targetUserId) {
    throw new InvalidUserError("A user cannot swipe on their own profile.");
  }

  const targetUser = db.prepare(
    "SELECT id FROM users WHERE id = ?",
  ).get(targetUserId);

  if (!targetUser) {
    throw new InvalidUserError("Target profile not found.");
  }

  const duplicate = db.prepare(`
    SELECT id FROM swipes
    WHERE swiper_user_id = ? AND target_user_id = ?
  `).get(swiperUserId, targetUserId);

  if (duplicate) {
    throw new DuplicateSwipeError("This profile has already been swiped on.");
  }

  const transaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO swipes (swiper_user_id, target_user_id, action)
      VALUES (?, ?, ?)
    `).run(swiperUserId, targetUserId, action);

    if (action === "pass") {
      return { mutualMatchCreated: false, matchId: null };
    }

    const reverseLike = db.prepare(`
      SELECT id FROM swipes
      WHERE swiper_user_id = ? AND target_user_id = ? AND action = 'like'
    `).get(targetUserId, swiperUserId);

    if (!reverseLike) {
      return { mutualMatchCreated: false, matchId: null };
    }

    const userOneId = Math.min(swiperUserId, targetUserId);
    const userTwoId = Math.max(swiperUserId, targetUserId);
    const result = db.prepare(`
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
