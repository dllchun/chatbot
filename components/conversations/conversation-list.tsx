'use client'

import { formatDistanceToNow } from 'date-fns'
import type { Conversation } from '@/types/api'

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (conversation: Conversation) => void
  onMobileSelect?: () => void
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onMobileSelect
}: ConversationListProps) {
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
    <div className="divide-y divide-slate-100">
      {conversations.map((conversation) => {
        const createdAt = new Date(conversation.created_at)
        console.log('Conversation timestamp:', {
          id: conversation.id,
          originalTimestamp: conversation.created_at,
          localTime: createdAt.toLocaleString(),
          utcTime: createdAt.toUTCString(),
          isoTime: createdAt.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })

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
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-slate-900">
                {conversation.customer || 'Anonymous'}
              </span>
              <span className="text-xs text-slate-500">
                {formatDistanceToNow(createdAt, { addSuffix: true })}
              </span>
            </div>
            <div className="mb-2 line-clamp-2 text-sm text-slate-500">
              {conversation.messages[conversation.messages.length - 1]?.content || 'No messages'}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                {conversation.source}
              </span>
              <span className="text-xs text-slate-500">
                {conversation.messages.length} messages
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
} 