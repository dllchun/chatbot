'use client'

import { PageContainer } from '@/components/new-version/page-container'
import { Button } from '@/components/ui/button'

interface PageProps {
  // Add page-specific props here
}

export default function TemplatePage({}: PageProps) {
  return (
    <PageContainer
      title="Page Title"
      description="Page description goes here"
      headerContent={
        <Button variant="outline" size="sm">
          Action Button
        </Button>
      }
    >
      {/* Main content goes here */}
      <div className="space-y-6">
        {/* Content sections */}
      </div>
    </PageContainer>
  )
} 