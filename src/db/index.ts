import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

// Create SQLite database for development
const sqlite = new Database(process.env.DATABASE_URL?.replace("file:", "") || "dev.db");

export const db = drizzle(sqlite, { schema });