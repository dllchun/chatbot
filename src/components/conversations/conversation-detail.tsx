'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, User, Calendar, Link as LinkIcon, ChevronLeft } from "lucide-react"
import type { Conversation } from "@/types/api"
import ReactMarkdown from 'react-markdown'
import { cn } from "@/lib/utils"

interface ConversationDetailProps {
  conversation: Conversation
  onBack?: () => void
}

const messageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

export function ConversationDetail({ conversation, onBack }: ConversationDetailProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    // Reset loading state when conversation changes
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
      scrollToBottom()
    }, 300)

    return () => clearTimeout(timer)
  }, [conversation.id])

  return (
    <div className="grid h-full grid-rows-[auto_1fr]">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
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
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  i % 2 === 0 ? "bg-slate-100 ml-0" : "bg-emerald-100 ml-auto"
                )}>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div className="space-y-4">
              {conversation.messages.map((message, index) => (
                <motion.div
                  key={index}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`flex ${
                    message.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === 'assistant'
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-emerald-500 text-white'
                    )}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
} 