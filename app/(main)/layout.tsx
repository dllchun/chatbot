'use client'

import { useState, useEffect } from 'react'
import { NewVersionSidebar } from '@/components/new-version/sidebar'
import { Container } from '@/components/new-version/container'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
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