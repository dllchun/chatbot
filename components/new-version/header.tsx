'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Bell, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function NewVersionHeader() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="border-b">
      {/* Main Header */}
      <div className="flex items-center justify-between px-8 py-6">
        {/* Left Section - Title */}
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">With What You Want To Work Today?</h1>
          <p className="text-sm text-zinc-500 mt-1">Choose Task from List Below Or Create New Shortcut</p>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-6">
          {/* Add New Button */}
          <Button size="sm" className="bg-[#6B4EFF] hover:bg-[#5B3EEF] text-white rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>

          {/* Feed Button */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Feed</span>
            <span className="text-xs text-zinc-500">Get New Updates Every Day</span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* User Profile */}
          <Button variant="ghost" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-8 py-4 bg-zinc-50">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Type A Keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-zinc-200"
          />
        </div>
      </div>
    </div>
  )
} 