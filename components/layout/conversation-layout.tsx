"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ConversationLayoutProps {
  sidebar: React.ReactNode
  content: React.ReactNode
  showMobileList?: boolean
  onMobileListChange?: (show: boolean) => void
}

export function ConversationLayout({
  sidebar,
  content,
  showMobileList = true,
  onMobileListChange
}: ConversationLayoutProps) {
  return (
    <div className="fixed inset-0 top-16 flex">
      {/* Sidebar */}
      <div
        className={`
          w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white
          ${showMobileList ? 'block' : 'hidden md:block'}
        `}
      >
        {sidebar}
      </div>

      {/* Main Content */}
      <div
        className={`
          flex-1 bg-white
          ${showMobileList ? 'hidden md:block' : 'block'}
        `}
      >
        {content}
      </div>
    </div>
  )
} 