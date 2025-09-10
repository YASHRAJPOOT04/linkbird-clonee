import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

// Dynamic schema import
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
let schemaModule: any;
if (process.env.NODE_ENV === "production") {
  schemaModule = require("@/db/schema-pg");
} else {
  schemaModule = require("@/db/schema");
}

const { users, sessions, accounts, verifications } = schemaModule;

// Get the deployment URL for trusted origins
const getDeploymentUrl = () => {
  // For Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For custom domain or explicit setting
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  
  // Fallback for local development
  return "http://localhost:3000";
};

const deploymentUrl = getDeploymentUrl();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: process.env.NODE_ENV === "production" ? "pg" : "sqlite",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-for-development",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  } : {},
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookie: {
      // Don't set domain to allow the cookie to work on the specific subdomain
      domain: undefined,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  trustedOrigins: [
    deploymentUrl,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://192.168.29.208:3000",
    "http://192.168.29.208:3001",
    "https://linkbird-clone-kmqf.vercel.app",
  ],
});

export type Session = typeof auth.$Infer.Session;
