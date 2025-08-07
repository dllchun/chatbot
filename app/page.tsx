'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoadingPage } from '@/components/ui/loading'

export default function Home() {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (userId) {
        // User is authenticated, redirect to conversations
        router.replace('/conversations')
      } else {
        // User is not authenticated, redirect to sign-in
        router.replace('/sign-in')
      }
    }
  }, [isLoaded, userId, router])

  // Show loading while checking authentication
  return <LoadingPage />
}
