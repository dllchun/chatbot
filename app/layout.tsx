'use client'

import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { PageTransition } from '@/components/layout/page-transition'
import { Suspense, useState, useEffect } from 'react'
import { LoadingPage } from '@/components/ui/loading'
import { Toaster } from 'sonner'
import { Inter } from 'next/font/google'
import { NewVersionSidebar } from '@/components/new-version/sidebar'
import { Container } from '@/components/new-version/container'
import { usePathname } from 'next/navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Wrap the authenticated content
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    // Initial check
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto collapse on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true)
    }
  }, [pathname, isMobile])

  // Show loading state
  if (!isLoaded) {
    return <LoadingPage />
  }

  // If on sign-in or sign-up pages, or not authenticated, show without sidebar
  if (!userId || pathname === '/sign-in' || pathname === '/sign-up') {
    return children
  }

  // Show authenticated layout with sidebar
  return (
    <div className="min-h-screen bg-[#25212d]">
      {/* Overlay */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setCollapsed(true)}
        />
      )}
      
      <div className="flex h-screen relative">
        <NewVersionSidebar 
          collapsed={collapsed}
          onCollapse={setCollapsed}
        />
        <Container>
          {children}
        </Container>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/conversations"
      signUpFallbackRedirectUrl="/conversations"
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider>
            <Suspense fallback={<LoadingPage />}>
              <PageTransition>
                <AuthenticatedLayout>
                  {children}
                </AuthenticatedLayout>
              </PageTransition>
            </Suspense>
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
