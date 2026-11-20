"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const databaseDirectory = process.env.DB_PATH
    ? node_path_1.default.dirname(node_path_1.default.resolve(process.env.DB_PATH))
    : node_path_1.default.resolve(process.cwd(), "data");
node_fs_1.default.mkdirSync(databaseDirectory, { recursive: true });
const databasePath = process.env.DB_PATH
    ? node_path_1.default.resolve(process.env.DB_PATH)
    : node_path_1.default.join(databaseDirectory, "coy-discover.db");
exports.db = new better_sqlite3_1.default(databasePath);
exports.db.pragma("foreign_keys = ON");
exports.db.pragma("journal_mode = WAL");
