import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  chatbotId: string | null
  isConfigured: boolean
  setChatbotId: (id: string | null) => void
  setIsConfigured: (configured: boolean) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      chatbotId: null,
      isConfigured: false,
      setChatbotId: (id) => set({ chatbotId: id, isConfigured: !!id }),
      setIsConfigured: (configured) => set({ isConfigured: configured }),
    }),
    {
      name: 'settings',
    }
  )
) 