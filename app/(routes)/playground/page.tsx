'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/store/settings'
import { useAuth } from '@clerk/nextjs'
import { ChatbotRequired } from '@/components/ui/chatbot-required'

export default function PlaygroundPage() {
  const { chatbotId, isConfigured } = useSettings()
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        const token = await getToken({ template: 'supabase' })
        if (!token) return

        const response = await fetch('/api/user/chatbot-preference', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()
        if (data.needsConfiguration) {
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('Error checking configuration:', error)
      }
    }

    checkConfiguration()
  }, [getToken])

  if (loading) {
    return null
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