import { create } from "zustand";

interface LeadDetailState {
  isOpen: boolean;
  leadId: string | null;
  
  // Actions
  openSheet: (leadId: string) => void;
  closeSheet: () => void;
  setLeadId: (leadId: string | null) => void;
}

export const useLeadDetailStore = create<LeadDetailState>((set) => ({
  isOpen: false,
  leadId: null,
  
  openSheet: (leadId: string) => {
    set({ isOpen: true, leadId });
  },
  
  closeSheet: () => {
    set({ isOpen: false, leadId: null });
  },
  
  setLeadId: (leadId: string | null) => {
    set({ leadId });
  },
}));

// Selectors for better performance
export const useLeadDetailState = () =>
  useLeadDetailStore((state) => ({
    isOpen: state.isOpen,
    leadId: state.leadId,
  }));

export const useLeadDetailActions = () =>
  useLeadDetailStore((state) => ({
    openSheet: state.openSheet,
    closeSheet: state.closeSheet,
    setLeadId: state.setLeadId,
  }));
