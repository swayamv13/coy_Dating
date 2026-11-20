import { db } from "../database/connection";

export interface EditableProfile {
  id: number
  name: string
  age: number
  location: string
  bio: string
  photoUrl: string
  photoCaption: string
  interests: string[]
}

interface ProfileRow {
  id: number
  name: string
  age: number
  location: string
  bio: string
  photo_url: string
  photo_caption: string
  interests: string
}

export function getProfile(userId: number): EditableProfile | null {
  const row = db.prepare(`
    SELECT u.id, u.name, p.age, p.location, p.bio, p.photo_url,
           p.photo_caption, p.interests
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE u.id = ?
  `).get(userId) as ProfileRow | undefined

  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    age: row.age,
    location: row.location,
    bio: row.bio,
    photoUrl: row.photo_url,
    photoCaption: row.photo_caption,
    interests: JSON.parse(row.interests) as string[],
  }
}

export interface ProfileUpdate {
  name: string
  age: number
  location: string
  bio: string
  photoCaption: string
  interests: string[]
}

export function updateProfile(userId: number, update: ProfileUpdate): EditableProfile | null {
  const transaction = db.transaction(() => {
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(update.name, userId)
    db.prepare(`
      UPDATE profiles
      SET age = ?, location = ?, bio = ?, photo_caption = ?, interests = ?
      WHERE user_id = ?
    `).run(
      update.age,
      update.location,
      update.bio,
      update.photoCaption,
      JSON.stringify(update.interests),
      userId,
    )
  })

  transaction()
  return getProfile(userId)
}

export function updateProfilePhoto(userId: number, photoUrl: string): EditableProfile | null {
  db.prepare("UPDATE profiles SET photo_url = ? WHERE user_id = ?").run(photoUrl, userId)
  return getProfile(userId)
}
