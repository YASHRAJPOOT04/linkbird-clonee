"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store/uiStore";
import { useAuth } from "@/components/providers/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebarMobile = useUIStore((state) => state.toggleSidebarMobile);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login");
    }
  }, [session, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          "lg:ml-0", // Desktop: sidebar is static, no margin needed
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebarMobile}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              LinkBird
            </span>
          </div>
          
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

