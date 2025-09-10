import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

// Use SQLite for local development
const sqlite = new Database(process.env.DATABASE_URL?.replace('file:', '') || "./dev.db");
export const db = drizzle(sqlite, { schema });