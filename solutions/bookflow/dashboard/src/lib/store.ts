import { create } from 'zustand'

export interface BusinessSummary {
  id: string
  name: string
  plan: string
}

interface AppStore {
  // Business context (multi-business)
  businesses: BusinessSummary[]
  businessId: string | null
  businessName: string
  setBusinesses: (businesses: BusinessSummary[]) => void
  setBusinessId: (id: string) => void
  setBusinessName: (name: string) => void
  /** Switch active business — sets cookie + updates store */
  switchBusiness: (id: string) => void

  // Sidebar state
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Set dynamically by useAuth hook after login
  businesses: [],
  businessId: null,
  businessName: '',

  setBusinesses: (businesses: BusinessSummary[]) => set({ businesses }),
  setBusinessId: (id: string) => set({ businessId: id }),
  setBusinessName: (name: string) => set({ businessName: name }),

  switchBusiness: (id: string) => {
    const biz = get().businesses.find((b) => b.id === id)
    if (!biz) return
    // Set cookie for middleware + server-side auth
    document.cookie = `vea_current_biz=${id};path=/;max-age=31536000;samesite=lax`
    // Invalidate the signed cache cookie so middleware re-queries
    document.cookie = 'vea_biz=;path=/;max-age=0'
    set({ businessId: id, businessName: biz.name })
    // Reload to re-scope all data
    window.location.reload()
  },

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}))
