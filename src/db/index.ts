import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

// For local development, use SQLite
const dbPath = path.join(process.cwd(), "dev.db");
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });