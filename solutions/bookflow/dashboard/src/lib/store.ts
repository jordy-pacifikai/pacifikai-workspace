import { create } from 'zustand'

interface AppStore {
  // Business context
  businessId: string | null
  businessName: string
  setBusinessId: (id: string) => void
  setBusinessName: (name: string) => void

  // Sidebar state
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  // Default to demo business
  businessId: 'a0000000-0000-0000-0000-000000000001',
  businessName: 'Salon Demo Tahiti',

  setBusinessId: (id: string) => set({ businessId: id }),
  setBusinessName: (name: string) => set({ businessName: name }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}))
