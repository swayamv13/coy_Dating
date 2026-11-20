import { db } from "../database/connection";

export interface PublicMatch {
  matchId: number;
  id: number;
  name: string;
  age: number;
  photo: string;
  city: string;
  bio: string;
  interests: string[];
  matchedAt: string;
}

interface MatchRow {
  match_id: number;
  id: number;
  name: string;
  age: number;
  photo_url: string;
  location: string;
  bio: string;
  interests: string;
  matched_at: string;
}

export function getMatchesForUser(userId: number): PublicMatch[] {
  const rows = db.prepare(`
    SELECT
      m.id AS match_id,
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
  `).all(userId, userId, userId, userId) as MatchRow[];

  return rows.map((row) => ({
    matchId: row.match_id,
    id: row.id,
    name: row.name,
    age: row.age,
    photo: row.photo_url,
    city: row.location,
    bio: row.bio,
    interests: JSON.parse(row.interests) as string[],
    matchedAt: row.matched_at,
  }));
}
