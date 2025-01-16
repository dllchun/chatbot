'use client'

import { formatDistanceToNow } from 'date-fns'
import type { Conversation } from '@/types/api'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ExportDialog } from './export-dialog'

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
  const [showExportDialog, setShowExportDialog] = useState(false)

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
          onClick={() => setShowExportDialog(true)}
          disabled={!chatbotId}
        >
          <Download className="w-4 h-4 mr-2" />
          {!chatbotId ? 'Configure Chatbot First' : 'Export Conversations'}
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
                  {conversation.source}
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

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        chatbotId={chatbotId || ''}
      />
    </>
  )
} 