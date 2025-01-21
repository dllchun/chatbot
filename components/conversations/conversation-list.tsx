'use client'

import { formatDistanceToNow } from 'date-fns'
import type { Conversation } from '@/types/api'
import { Download, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ExportDialog } from './export-dialog'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (conversation: Conversation) => void
  onMobileSelect?: () => void
  chatbotId?: string
}

// Helper function to format Hong Kong phone number
function formatHKPhoneNumber(number: string): string | null {
  // Remove all non-digit characters
  const digits = number.replace(/\D/g, '')
  
  // Handle different formats
  if (digits.startsWith('852')) {
    // If starts with 852, take the last 8 digits
    const last8 = digits.slice(-8)
    return last8.length === 8 ? last8 : null
  } else if (digits.length === 8) {
    // If exactly 8 digits, use as is
    return digits
  }
  return null
}

// Helper function to find Hong Kong phone number in messages
function findHKPhoneNumber(messages: any[]): string | null {
  for (const message of messages) {
    if (message.role === 'user') {
      // Look for numbers that might be phone numbers
      // Matches:
      // - 8-digit numbers (12345678)
      // - Numbers with 852 prefix (85212345678)
      // - Numbers with +852 prefix (+85212345678)
      // - Numbers with spaces or hyphens (8521 2345 6789, 852-1234-5678)
      const matches = message.content.match(/(?:\+?852[- ]?)?\d{4}[- ]?\d{4}|\b\d{8}\b/g)
      if (matches) {
        for (const match of matches) {
          const formattedNumber = formatHKPhoneNumber(match)
          if (formattedNumber) {
            return formattedNumber
          }
        }
      }
    }
  }
  return null
}

// Helper function to get conversation title
function getConversationTitle(conversation: Conversation, t: any): string {
  // Handle WhatsApp source specifically
  if (conversation.source?.toLowerCase() === 'whatsapp') {
    // First try to find a phone number in user messages
    const phoneNumber = findHKPhoneNumber(conversation.messages)
    if (phoneNumber) {
      return `${t('common.whatsapp')}: ${phoneNumber}`
    }

    // If no phone number found in messages, try whatsapp_number
    if (conversation.whatsapp_number) {
      const formattedNumber = formatHKPhoneNumber(conversation.whatsapp_number)
      if (formattedNumber) {
        return `${t('common.whatsapp')}: ${formattedNumber}`
      }
    }

    // If no number found for WhatsApp, show NA
    return t('common.whatsappNA')
  }

  // Handle website sources
  const websiteSources = ['Widget or Iframe', 'playground']
  if (websiteSources.includes(conversation.source?.toLowerCase() || '')) {
    return t('common.website')
  }

  // Fallback to source or unknown
  return conversation.source || t('common.unknown')
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onMobileSelect,
  chatbotId
}: ConversationListProps) {
  const { t } = useTranslation()
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSelect = async (conversation: Conversation) => {
    setIsLoading(true)
    onSelect(conversation)
    onMobileSelect?.()
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100))
    setIsLoading(false)
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center">
        <div>
          <p className="mb-2 text-slate-900">{t('common.noConversations')}</p>
          <p className="text-sm text-slate-500">{t('common.tryAdjusting')}</p>
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
          {!chatbotId ? t('common.configureChatbot') : t('common.exportConversations')}
        </Button>
      </div>
      <div className="divide-y divide-slate-100">
        {conversations.map((conversation) => {
          const createdAt = new Date(conversation.created_at)
          const title = getConversationTitle(conversation, t)
          const isSelected = selectedId === conversation.id

          return (
            <button
              key={conversation.id}
              onClick={() => handleSelect(conversation)}
              className={cn(
                "w-full p-4 text-left transition-colors hover:bg-slate-50",
                isSelected && "bg-slate-50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">
                  {title}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(createdAt, { addSuffix: true })}
                </span>
              </div>
              <div className="mt-1">
                <p className="line-clamp-2 text-sm text-slate-500">
                  {conversation.messages[conversation.messages.length - 1]?.content || t('common.noMessages')}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {!selectedId && !isLoading && (
        <div className="hidden md:flex h-full items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{t('common.selectConversation')}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="hidden md:block">
          <div className="p-4 space-y-4 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded"></div>
              <div className="h-3 bg-slate-100 rounded w-5/6"></div>
              <div className="h-3 bg-slate-100 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      )}

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        chatbotId={chatbotId || ''}
      />
    </>
  )
} 