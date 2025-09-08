// For local development, we'll use SQLite
// For production with DATABASE_URL, you can switch to PostgreSQL
export { localDb as db } from "./local";