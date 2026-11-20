import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const databaseDirectory = process.env.DB_PATH
  ? path.dirname(path.resolve(process.env.DB_PATH))
  : path.resolve(process.cwd(), "data");

fs.mkdirSync(databaseDirectory, { recursive: true });

const databasePath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(databaseDirectory, "coy-discover.db");

export const db = new Database(databasePath);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
