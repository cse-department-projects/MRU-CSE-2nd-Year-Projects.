import { create } from 'zustand';

interface AppState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;

  // Context Panel (right side)
  contextPanelOpen: boolean;
  contextPanelType: 'athlete' | 'coach' | 'org' | 'match' | 'training' | null;
  contextPanelId: string | null;
  openContextPanel: (type: 'athlete' | 'coach' | 'org' | 'match' | 'training', id: string) => void;
  closeContextPanel: () => void;

  // Command Palette
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

export const useNavigation = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  mobileSidebarOpen: false,
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

  contextPanelOpen: false,
  contextPanelType: null,
  contextPanelId: null,
  openContextPanel: (type, id) => set({ contextPanelOpen: true, contextPanelType: type, contextPanelId: id }),
  closeContextPanel: () => set({ contextPanelOpen: false, contextPanelType: null, contextPanelId: null }),

  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
}));

