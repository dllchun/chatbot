import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  chatbotId: string | null
  isConfigured: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  setChatbotId: (id: string | null) => void
  setIsConfigured: (configured: boolean) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  chatbotId: null,
  isConfigured: false,
  isLoading: true,
  isInitialized: false,
  error: null,
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setChatbotId: (id) => set({ chatbotId: id, isConfigured: !!id }),
      setIsConfigured: (configured) => set({ isConfigured: configured }),
      setLoading: (loading) => set({ isLoading: loading }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'settings',
    }
  )
) 