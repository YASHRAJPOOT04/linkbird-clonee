import { createAuthClient } from "better-auth/react";

// Get the base URL from environment variables or use the deployed URL
const getBaseURL = () => {
  // For client-side, use window.location.origin as the most reliable source
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // For server-side, use BETTER_AUTH_URL or fallback
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include",
    onError: async (ctx) => {
      try {
        const status = ctx?.response?.status;
        const url = ctx?.request?.url;
        let body: unknown = undefined;
        if (ctx?.response && typeof ctx.response.clone === "function") {
          const clone = ctx.response.clone();
          const text = await clone.text().catch(() => "");
          try {
            body = text ? JSON.parse(text) : undefined;
          } catch {
            body = text;
          }
        }
        // Log a structured error so we can see exactly what failed
        console.error("Auth client error:", { status, url, body });
      } catch (_e) {
        console.error("Auth client error:", ctx?.error ?? {});
      }
    },
  },
});
