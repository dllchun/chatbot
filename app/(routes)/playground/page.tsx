'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ChatbotRequired } from '@/components/ui/chatbot-required'
import { useChatbotPreference } from '@/lib/hooks/useChatbotPreference'
import { LoadingPage } from '@/components/ui/loading'
import { PageContainer } from '@/components/new-version/page-container'
import { useTranslation } from 'react-i18next'

export default function PlaygroundPage() {
  const { t } = useTranslation()
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
    <PageContainer
      title={t('components.sidebar.menu.playground')}
      description={t('pages.playground.description')}
    >
      <iframe
        src={`https://www.chatbase.co/chatbot-iframe/${chatbotId}`}
        width="100%"
        height="100%"
        frameBorder="0"
        className="rounded-lg shadow-lg"
      />
    </PageContainer>
  )
} 