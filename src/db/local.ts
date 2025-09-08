import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./sqlite-schema";

// Create a local SQLite database for development
const sqlite = new Database("./dev.db");
export const localDb = drizzle({ client: sqlite, schema });