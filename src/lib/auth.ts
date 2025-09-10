import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { users, sessions, accounts, verifications } from "@/db/schema";

// Get all possible trusted origins
const getTrustedOrigins = () => {
  // In development, be more permissive
  if (process.env.NODE_ENV === "development") {
    return [
      "http://localhost:3000",
      "http://localhost:3001", 
      "http://localhost:3002",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3002",
    ];
  }
  
  const origins = new Set<string>();
  
  // Add Vercel deployment URLs
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }
  
  // Add custom domain or explicit setting
  if (process.env.BETTER_AUTH_URL) {
    origins.add(process.env.BETTER_AUTH_URL);
  }
  
  // Add Next.js public app URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.add(process.env.NEXT_PUBLIC_APP_URL);
  }
  
  // Add Vercel branch URLs (for preview deployments)
  if (process.env.VERCEL_BRANCH_URL) {
    origins.add(`https://${process.env.VERCEL_BRANCH_URL}`);
  }
  
  // Add all Vercel preview URLs (common pattern)
  if (process.env.VERCEL && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  
  // Add any custom origins from environment
  if (process.env.CUSTOM_ORIGINS) {
    const customOrigins = process.env.CUSTOM_ORIGINS.split(',');
    customOrigins.forEach(origin => origins.add(origin.trim()));
  }
  
  // Fallback to localhost for development
  origins.add("http://localhost:3000");
  origins.add("http://localhost:3001");
  origins.add("http://localhost:3002");
  
  const finalOrigins = Array.from(origins);
  
  // Debug logging
  console.log("Better-auth trusted origins:", finalOrigins);
  console.log("Environment variables:", {
    VERCEL_URL: process.env.VERCEL_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV
  });
  
  return finalOrigins;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users,
      sessions,
      accounts,
      verifications,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-for-development",
  baseURL: process.env.BETTER_AUTH_URL,
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
  trustedOrigins: getTrustedOrigins(),
});

export type Session = typeof auth.$Infer.Session;
