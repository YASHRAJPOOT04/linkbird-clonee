import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

// Create a Neon serverless pool so Drizzle can manage connections reliably
// Use a fallback connection string for build time if DATABASE_URL is not set
const connectionString = process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/db";
const pool = new Pool({ connectionString });

export const db = drizzle({ client: pool, schema });