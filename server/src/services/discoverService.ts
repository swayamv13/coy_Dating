import { db } from "../database/connection";

export interface PublicProfile {
  id: number;
  name: string;
  age: number;
  gender: string;
  photoCaption: string;
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
  photo_caption: string;
  bio: string;
  location: string;
  photo_url: string;
  interests: string;
}

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

export function getDiscoverProfiles(
  currentUserId: number,
  limit: number,
  offset: number,
): { profiles: PublicProfile[]; total: number } {
  const rows = db.prepare(`
    SELECT u.id, u.name, p.age, p.gender, p.photo_caption, p.bio,
           p.location, p.photo_url, p.interests
    FROM users u
    INNER JOIN profiles p ON p.user_id = u.id
    WHERE ${discoverFilter}
    ORDER BY u.id DESC
    LIMIT ? OFFSET ?
  `).all(currentUserId, currentUserId, currentUserId, limit, offset) as ProfileRow[];

  const countRow = db.prepare(`
    SELECT COUNT(*) AS total
    FROM users u
    INNER JOIN profiles p ON p.user_id = u.id
    WHERE ${discoverFilter}
  `).get(currentUserId, currentUserId, currentUserId) as { total: number };

  const profiles = rows.map((row) => ({
    id: row.id,
    name: row.name,
    age: row.age,
    gender: row.gender,
    photoCaption: row.photo_caption,
    bio: row.bio,
    location: row.location,
    photoUrl: row.photo_url,
    interests: JSON.parse(row.interests) as string[],
  }));

  return { profiles, total: countRow.total };
}
