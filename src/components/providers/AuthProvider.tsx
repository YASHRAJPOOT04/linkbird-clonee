"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface AuthContextType {
  session: { user: { id: string; email: string; name: string } } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ user: { id: string; email: string; name: string } } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        // Use the authClient to get the session instead of direct fetch
        const result = await authClient.getSession();
        if (result.data) {
          setSession(result.data);
        }
      } catch (_error) {
        console.error("Failed to get session:", _error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        console.error("Sign in error:", result.error);
        const errorMessage = result.error.message || "Invalid email or password";
        
        // Handle specific error cases
        if (errorMessage.includes("USER_NOT_FOUND")) {
          return { error: "User not found. Please check your email or sign up." };
        } else if (errorMessage.includes("INVALID_PASSWORD")) {
          return { error: "Invalid password. Please try again." };
        }
        
        return { error: errorMessage };
      } else if (result.data) {
        setSession(result.data);
        return {};
      } else {
        return { error: "Authentication failed" };
      }
    } catch (error) {
      console.error("Network error during sign in:", error);
      return { error: "Network error. Please check your connection and try again." };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        const errorMessage = result.error.message || "Registration failed";
        
        // Handle specific error cases
        if (errorMessage.includes("USER_ALREADY_EXISTS")) {
          return { error: "An account with this email already exists. Please sign in instead." };
        } else if (errorMessage.includes("INVALID_EMAIL")) {
          return { error: "Please enter a valid email address." };
        } else if (errorMessage.includes("PASSWORD_TOO_SHORT")) {
          return { error: "Password must be at least 6 characters long." };
        }
        
        return { error: errorMessage };
      } else if (result.data) {
        setSession(result.data);
        return {};
      } else {
        return { error: "Registration failed. Please try again." };
      }
    } catch (error) {
      console.error("Sign up error:", error);
      return { error: "Network error. Please check your connection and try again." };
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setSession(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Use window.location.origin to ensure the callback URL is correct
      const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/campaigns` : '/campaigns';
      
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch (error) {
      console.error("Google sign in failed:", error);
      throw new Error("Google authentication is not available");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AppAuthProvider");
  }
  return context;
}
