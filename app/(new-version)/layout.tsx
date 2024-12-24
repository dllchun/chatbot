'use client'

import { useState } from 'react'
import { NewVersionSidebar } from '@/components/new-version/sidebar'
import { Container } from '@/components/new-version/container'

interface NewVersionLayoutProps {
  children: React.ReactNode
}

export default function NewVersionLayout({ children }: NewVersionLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#25212d]">
      <div className="flex h-screen">
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