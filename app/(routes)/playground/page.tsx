'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ChatbotRequired } from '@/components/ui/chatbot-required'
import { useChatbotPreference } from '@/lib/hooks/useChatbotPreference'
import { LoadingPage } from '@/components/ui/loading'

export default function PlaygroundPage() {
  const { chatbotId, isConfigured, isLoading: isPreferenceLoading, isInitialized } = useChatbotPreference()
  const { isLoaded: isAuthLoaded } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isAuthLoaded || !isInitialized) {
    return <LoadingPage />
  }

  if (!isConfigured) {
    return <ChatbotRequired />
  }

  return (
    <div className="container py-8">
      <iframe
        src={`https://www.chatbase.co/chatbot-iframe/${chatbotId}`}
        width="100%"
        height="700"
        frameBorder="0"
        className="rounded-lg shadow-lg"
      />
    </div>
  )
} 