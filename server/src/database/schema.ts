import { db } from "./connection";

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      user_id INTEGER PRIMARY KEY,
      age INTEGER NOT NULL CHECK (age >= 18),
      gender TEXT NOT NULL,
      bio TEXT NOT NULL,
      location TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      interests TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS swipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      swiper_user_id INTEGER NOT NULL,
      target_user_id INTEGER NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('like', 'pass')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (swiper_user_id, target_user_id),
      CHECK (swiper_user_id != target_user_id),
      FOREIGN KEY (swiper_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_one_id INTEGER NOT NULL,
      user_two_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_one_id, user_two_id),
      CHECK (user_one_id < user_two_id),
      FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON swipes(swiper_user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
  `);

  const profileColumns = db
    .prepare("PRAGMA table_info(profiles)")
    .all() as Array<{ name: string }>;

  if (!profileColumns.some((column) => column.name === "photo_caption")) {
    db.exec("ALTER TABLE profiles ADD COLUMN photo_caption TEXT NOT NULL DEFAULT ''");
  }
}
