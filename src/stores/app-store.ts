import { create } from 'zustand'
import type { ViewId } from '@/types'

interface AppState {
  currentView: ViewId
  sidebarOpen: boolean
  commandPaletteOpen: boolean
  setView: (view: ViewId) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  sidebarOpen: true,
  commandPaletteOpen: false,
  setView: (view) => set({ currentView: view, sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}))
