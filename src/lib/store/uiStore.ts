import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarMobile: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
  
  // Reset function for logout
  resetUI: () => void;
}

const initialState = {
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
};

export const useUIStore = create<UIState>()(
  persist(
    (set, _get) => ({
      ...initialState,
      
      // Toggle sidebar collapsed state
      toggleSidebar: () => {
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        }));
      },
      
      // Set sidebar collapsed state
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },
      
      // Toggle mobile sidebar open state
      toggleSidebarMobile: () => {
        set((state) => ({
          sidebarMobileOpen: !state.sidebarMobileOpen,
        }));
      },
      
      // Set mobile sidebar open state
      setSidebarMobileOpen: (open: boolean) => {
        set({ sidebarMobileOpen: open });
      },
      
      // Reset UI state (useful for logout)
      resetUI: () => {
        set(initialState);
      },
    }),
    {
      name: "linkbird-ui-store",
      // Only persist sidebar collapsed state, not mobile state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Selectors for better performance
export const useSidebarState = () =>
  useUIStore((state) => ({
    sidebarCollapsed: state.sidebarCollapsed,
    sidebarMobileOpen: state.sidebarMobileOpen,
  }));

export const useSidebarActions = () =>
  useUIStore((state) => ({
    toggleSidebar: state.toggleSidebar,
    setSidebarCollapsed: state.setSidebarCollapsed,
    toggleSidebarMobile: state.toggleSidebarMobile,
    setSidebarMobileOpen: state.setSidebarMobileOpen,
  }));
