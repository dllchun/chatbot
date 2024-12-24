import { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useSettings } from '@/lib/store/settings'

export function useChatbotPreference() {
  const { getToken, isLoaded: isAuthLoaded } = useAuth()
  const { isLoaded: isUserLoaded } = useUser()
  const {
    chatbotId,
    isConfigured,
    isLoading,
    isInitialized,
    error,
    setChatbotId,
    setLoading,
    setInitialized,
    setError
  } = useSettings()

  useEffect(() => {
    const fetchPreference = async () => {
      // Skip if already initialized or not ready
      if (isInitialized || !isAuthLoaded || !isUserLoaded) {
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get token from Clerk
        const token = await getToken()
        if (!token) {
          setError('Authentication token not available')
          return
        }

        const response = await fetch('/api/user/chatbot-preference', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        })

        const text = await response.text()
        let data
        try {
          data = JSON.parse(text)
        } catch (e) {
          console.error('Failed to parse response:', e)
          setError('Failed to parse server response')
          return
        }

        if (data.chatbotId) {
          setChatbotId(data.chatbotId)
        }
      } catch (error) {
        console.error('Error fetching chatbot preference:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch chatbot preference')
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    fetchPreference()
  }, [isAuthLoaded, isUserLoaded, isInitialized, getToken, setChatbotId, setLoading, setInitialized, setError])

  return {
    chatbotId,
    isConfigured,
    isLoading,
    isInitialized,
    error,
    setChatbotId
  }
} 