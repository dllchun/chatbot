'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { MessageSquare, User, Calendar, Link as LinkIcon, ChevronLeft } from "lucide-react"
import type { Conversation } from "@/types/api"
import ReactMarkdown from 'react-markdown'

interface ConversationDetailProps {
  conversation: Conversation
  onBack?: () => void
}

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function ConversationDetail({ conversation, onBack }: ConversationDetailProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [conversation.id]) // Scroll when conversation changes

  return (
    <div className="grid h-full grid-rows-[auto_1fr]">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-slate-50/80">
        {/* Back Button */}
        <div className="p-4 md:hidden">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-emerald-600"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
              <ChevronLeft className="h-5 w-5" />
            </div>
            <span className="ml-2">Back to Conversations</span>
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 p-4">
          {/* Customer Card */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <User className="h-4 w-4" />
              <span className="text-sm">Customer</span>
            </div>
            <p className="text-sm font-medium text-slate-900">
              {conversation.customer || 'Anonymous'}
            </p>
          </div>

          {/* Source Card */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <LinkIcon className="h-4 w-4" />
              <span className="text-sm">Source</span>
            </div>
            <p className="text-sm font-medium text-slate-900">
              {conversation.source}
            </p>
          </div>

          {/* Date Card */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Date</span>
            </div>
            <p className="text-sm font-medium text-slate-900">
              {new Date(conversation.created_at).toLocaleString()}
            </p>
          </div>

          {/* Messages Card */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Messages</span>
            </div>
            <p className="text-sm font-medium text-slate-900">
              {conversation.messages.length}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="overflow-y-auto p-4">
        <div className="space-y-4">
          {conversation.messages.map((message, index) => (
            <motion.div
              key={index}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              className={`flex ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'assistant'
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
} 