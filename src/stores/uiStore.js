import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: false,
  activeMode: 'chama', // 'chama' | 'investments'
  isOnline: navigator.onLine,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setOnlineStatus: (status) => set({ isOnline: status }),
}));

export default useUIStore;