'use client'

import { useState, useEffect } from 'react'
import { Inter } from 'next/font/google'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/components/providers/language-provider'
import { NewVersionSidebar } from '@/components/new-version/sidebar'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from 'sonner'
import { usePathname } from 'next/navigation'
import { LoadingPage } from '@/components/ui/loading'
import '@/lib/i18n'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true)
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
      setSidebarCollapsed(true)
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

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden h-14 bg-[#25212d] z-50 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(false)}
            className="text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-3 text-xl font-bold flex items-center text-white">
            <span className="text-[#6B4EFF] mr-1">i2</span>
            <span>.ai</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex h-[calc(100vh-3.5rem)] md:h-screen relative">
        <NewVersionSidebar
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} overflow-hidden`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <LanguageProvider>
              <AuthenticatedLayout>
                {children}
              </AuthenticatedLayout>
            </LanguageProvider>
          </ThemeProvider>
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}
