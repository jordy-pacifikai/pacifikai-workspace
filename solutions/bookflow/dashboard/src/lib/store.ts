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
  // Set dynamically by useAuth hook after login
  businessId: null,
  businessName: '',

  setBusinessId: (id: string) => set({ businessId: id }),
  setBusinessName: (name: string) => set({ businessName: name }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}))
