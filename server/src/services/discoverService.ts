import { db } from "../database/connection";

export interface PublicProfile {
  id: number;
  name: string;
  age: number;
  gender: string;
  bio: string;
  location: string;
  photoUrl: string;
  interests: string[];
}

interface ProfileRow {
  id: number;
  name: string;
  age: number;
  gender: string;
  bio: string;
  location: string;
  photo_url: string;
  interests: string;
}

export function getDiscoverProfiles(
  currentUserId: number,
  limit: number,
  offset: number,
): { profiles: PublicProfile[]; total: number } {
  const rows = db.prepare(`
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
  `).all(currentUserId, currentUserId, limit, offset) as ProfileRow[];

  const countRow = db.prepare(`
    SELECT COUNT(*) AS total
    FROM users u
    INNER JOIN profiles p ON p.user_id = u.id
    WHERE u.id != ?
      AND NOT EXISTS (
        SELECT 1 FROM swipes s
        WHERE s.swiper_user_id = ? AND s.target_user_id = u.id
      )
  `).get(currentUserId, currentUserId) as { total: number };

  const profiles = rows.map((row) => ({
    id: row.id,
    name: row.name,
    age: row.age,
    gender: row.gender,
    bio: row.bio,
    location: row.location,
    photoUrl: row.photo_url,
    interests: JSON.parse(row.interests) as string[],
  }));

  return { profiles, total: countRow.total };
}
