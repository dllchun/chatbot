'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { MessageSquare, User, Calendar, Link as LinkIcon, ChevronLeft } from "lucide-react"
import type { Conversation } from "@/types/api"

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
              <span>Customer</span>
            </div>
            <p className="font-medium text-slate-900">
              {conversation.customer || "Anonymous"}
            </p>
          </div>

          {/* Source Card */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <MessageSquare className="h-4 w-4" />
              <span>Source</span>
            </div>
            <p className="font-medium text-slate-900">
              {conversation.source}
            </p>
          </div>

          {/* Started Card */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>Started</span>
            </div>
            <p className="font-medium text-slate-900">
              {new Date(conversation.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Chat ID Card */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <LinkIcon className="h-4 w-4" />
              <span>Chat ID</span>
            </div>
            <p className="font-medium text-slate-900">
              {conversation.id}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="h-full overflow-y-auto bg-white p-4">
        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {conversation.messages.map((message, index) => (
            <motion.div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
              variants={messageVariants}
            >
              <div
                className={`max-w-[80%] overflow-hidden rounded-2xl p-3 ${
                  message.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.timestamp && (
                  <p className="mt-1 text-[10px] opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </motion.div>
      </div>
    </div>
  )
} 