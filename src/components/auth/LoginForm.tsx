"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        const errorMessage = result.error === "Invalid email or password" 
          ? "Invalid email or password. Please try again." 
          : result.error;
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
      } else {
        toast.success("Successfully signed in!");
        onSuccess?.();
        // Force redirect to campaigns page
        window.location.href = "/campaigns";
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = "Unable to sign in. Please check your connection and try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google login error:", err);
      const errorMessage = "Google sign in is currently unavailable. Please try signing in with email and password.";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your LinkBird account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                className="pl-10"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={isLoading}
                autoComplete="current-password"
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          {/* Demo Login Button */}
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={(e) => {
              e.preventDefault();
              console.log("Demo credentials button clicked");
              setEmail("test@example.com");
              setPassword("password123");
              toast.success("Demo credentials filled!");
            }}
            disabled={isLoading}
          >
            📋 Fill Demo Credentials
          </Button>

          {/* Direct Dashboard Access Button */}
          <div className="space-y-2">
            <Button 
              type="button" 
              variant="secondary" 
              className="w-full" 
              onClick={(e) => {
                e.preventDefault();
                console.log("Dashboard button clicked");
                toast.success("Opening dashboard...");
                setTimeout(() => {
                  window.location.href = "/campaigns";
                }, 500);
              }}
              disabled={isLoading}
            >
              🚀 Go to Dashboard (Demo)
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={(e) => {
                e.preventDefault();
                console.log("Demo dashboard button clicked");
                toast.success("Opening demo dashboard...");
                setTimeout(() => {
                  window.location.href = "/demo-dashboard";
                }, 500);
              }}
              disabled={isLoading}
            >
              🎯 Simple Demo Dashboard
            </Button>
          </div>
        </form>

{process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED !== "false" && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>
          </>
        )}

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
