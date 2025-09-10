import { NextResponse } from "next/server";

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      // Don't expose DATABASE_URL or secrets
    },
    headers: {
      host: process.env.VERCEL_URL || 'localhost',
      // We can add request headers here if needed
    }
  };

  return NextResponse.json(debugInfo);
}