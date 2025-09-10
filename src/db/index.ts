// Lazy database initialization to avoid build-time issues
/* eslint-disable @typescript-eslint/no-explicit-any */
let dbInstance: any = null;

export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!dbInstance) {
      initializeDatabase();
    }
    return dbInstance[prop];
  }
});

function initializeDatabase() {
  if (dbInstance) return;

  if (process.env.NODE_ENV === "production") {
    // Production: Use Neon/PostgreSQL
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { drizzle } = require("drizzle-orm/neon-serverless");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Pool } = require("@neondatabase/serverless");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const schema = require("./schema-pg");
      
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is required in production");
      }
      
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      dbInstance = drizzle({ client: pool, schema });
    } catch (error) {
      console.error("Failed to initialize production database:", error);
      throw error;
    }
  } else {
    // Development: Use SQLite
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { drizzle } = require("drizzle-orm/better-sqlite3");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require("better-sqlite3");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const schema = require("./schema");
      
      const sqlite = new Database("./dev.db");
      dbInstance = drizzle(sqlite, { schema });
    } catch (error) {
      console.error("Failed to initialize development database:", error);
      throw error;
    }
  }
}