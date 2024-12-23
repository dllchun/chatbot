'use client'

import { formatDistanceToNow } from 'date-fns'
import type { Conversation } from '@/types/api'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (conversation: Conversation) => void
  onMobileSelect?: () => void
  chatbotId?: string
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onMobileSelect,
  chatbotId
}: ConversationListProps) {
  const { getToken } = useAuth()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      console.log('Export attempt with chatbotId:', chatbotId)
      
      if (!chatbotId) {
        throw new Error('Chatbot ID is required')
      }

      setIsExporting(true)
      toast.info('Starting export...')
      
      const token = await getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/conversations/export?chatbotId=${chatbotId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Export failed')
      }

      const contentType = response.headers.get('Content-Type')
      if (!contentType || !contentType.includes('text/csv')) {
        throw new Error('Invalid response format')
      }

      toast.success('Export completed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conversations-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsExporting(false)
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center">
        <div>
          <p className="mb-2 text-slate-900">No conversations found</p>
          <p className="text-sm text-slate-500">Try adjusting your filters or search query</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 border-b border-slate-200">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleExport}
          disabled={isExporting || !chatbotId}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              {!chatbotId ? 'Configure Chatbot First' : 'Export Conversations'}
            </>
          )}
        </Button>
      </div>
      <div className="divide-y divide-slate-100">
        {conversations.map((conversation) => {
          const createdAt = new Date(conversation.created_at)

          return (
            <button
              key={conversation.id}
              onClick={() => {
                onSelect(conversation)
                onMobileSelect?.()
              }}
              className={`w-full p-4 text-left transition-colors hover:bg-slate-50 ${
                selectedId === conversation.id ? 'bg-slate-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">
                  {conversation.customer || 'Anonymous'}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(createdAt, { addSuffix: true })}
                </span>
              </div>
              <div className="mt-1">
                <p className="line-clamp-2 text-sm text-slate-500">
                  {conversation.messages[conversation.messages.length - 1]?.content || 'No messages'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
} 