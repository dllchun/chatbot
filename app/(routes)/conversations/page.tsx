'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ConversationLayout } from '@/components/layout/conversation-layout'
import { ConversationList } from '@/components/conversations/conversation-list'
import { ConversationDetail } from '@/components/conversations/conversation-detail'
import { SearchInput } from '@/components/ui/search-input'
import { Card } from '@/components/ui/card'
import { Filter, Calendar, MessageSquare, User } from 'lucide-react'
import { LoadingPage } from '@/components/ui/loading'
import type { Conversation } from '@/types/api'
import { useSettings } from '@/lib/store/settings'
import { ChatbotRequired } from '@/components/ui/chatbot-required'

interface FilterOptions {
  source: string
  dateRange: string
  messageCount: string
}

export default function ConversationsPage() {
  const { chatbotId, isConfigured } = useSettings()
  const { getToken } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileList, setShowMobileList] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    source: 'all',
    dateRange: 'all',
    messageCount: 'all'
  })

  // API state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  async function fetchConversations(pageNum: number, append = false) {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      const token = await getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Calculate date range based on filter
      let startDate, endDate
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (filters.dateRange) {
        case 'today':
          startDate = today.toISOString()
          endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
          break
        case 'week':
          endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
          startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()
          break
        case 'month':
          endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toISOString()
          break
        default:
          // For 'all', use a wide date range to get all conversations
          startDate = '2024-01-01T00:00:00.000Z'
          endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      }

      console.log('Date Range:', {
        dateRangeFilter: filters.dateRange,
        startDate,
        endDate,
        now: new Date().toISOString(),
        localStartDate: new Date(startDate).toLocaleString(),
        localEndDate: new Date(endDate).toLocaleString(),
        utcStartDate: new Date(startDate).toUTCString(),
        utcEndDate: new Date(endDate).toUTCString()
      })

      // Build query parameters
      const params = new URLSearchParams({
        chatbotId: chatbotId || '',
        page: pageNum.toString(),
        size: '20',
        startDate,
        endDate,
        ...(filters.source !== 'all' && { source: filters.source })
      })

      const response = await fetch(`/api/conversations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response Structure:', {
        hasData: Boolean(data.data),
        dataType: data.data ? typeof data.data : null,
        isArray: Array.isArray(data.data),
        firstItem: data.data?.[0] ? {
          id: data.data[0].id,
          source: data.data[0].source,
          hasMessages: Boolean(data.data[0].messages),
          messagesType: data.data[0].messages ? typeof data.data[0].messages : null,
          isMessagesArray: Array.isArray(data.data[0].messages)
        } : null
      })
      
      if (append) {
        setConversations(prev => [...prev, ...data.data])
      } else {
        setConversations(data.data)
      }

      setHasMore(data.data.length === 20) // If we got less than 20 results, there are no more pages
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    if (isConfigured) {
      console.log('Fetching conversations with filters:', {
        source: filters.source,
        dateRange: filters.dateRange,
        messageCount: filters.messageCount,
        searchQuery
      })
      setPage(1)
      fetchConversations(1)
    }
  }, [getToken, filters.source, filters.dateRange, isConfigured])

  useEffect(() => {
    console.log('Search or message count filter changed:', {
      searchQuery,
      messageCountFilter: filters.messageCount,
      totalConversations: conversations.length
    })
  }, [searchQuery, filters.messageCount, conversations.length])

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchConversations(nextPage, true)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight * 1.5) { // Load more when user scrolls to 75% of the list
      handleLoadMore()
    }
  }

  const filteredConversations = conversations.filter(conv => {
    console.log('Filtering conversation:', {
      id: conv.id,
      customer: conv.customer,
      messageCount: conv.messages?.length,
      hasMessages: Boolean(conv.messages),
      messagesType: typeof conv.messages,
      isMessagesArray: Array.isArray(conv.messages),
      source: conv.source,
      created_at: conv.created_at
    })

    const matchesSearch = searchQuery === "" || (
      (conv.customer?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (Array.isArray(conv.messages) && conv.messages.some(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    )

    const matchesMessageCount = filters.messageCount === 'all' || (() => {
      if (!Array.isArray(conv.messages)) {
        console.log('Messages is not an array:', {
          id: conv.id,
          messages: conv.messages
        })
        return false
      }
      const count = conv.messages.length
      switch (filters.messageCount) {
        case 'short':
          return count <= 5
        case 'medium':
          return count > 5 && count <= 15
        case 'long':
          return count > 15
        default:
          return true
      }
    })()

    console.log('Filter results:', {
      id: conv.id,
      matchesSearch,
      matchesMessageCount,
      searchQuery,
      messageCountFilter: filters.messageCount
    })

    return matchesSearch && matchesMessageCount
  })

  console.log('Filtered Conversations:', {
    total: filteredConversations.length,
    firstConv: filteredConversations[0] ? {
      id: filteredConversations[0].id,
      created_at: filteredConversations[0].created_at,
      source: filteredConversations[0].source
    } : null,
    allIds: filteredConversations.map(conv => conv.id)
  })

  if (!isConfigured) {
    return <ChatbotRequired />
  }

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 p-4">
        <div className="rounded-lg bg-red-50 p-4 text-red-500">
          {error}
        </div>
      </div>
    )
  }

  return (
    <ConversationLayout
      sidebar={
        <div className="flex h-full flex-col">
          {/* Search and Filter Header */}
          <div className="flex-none border-b p-4 space-y-4">
            <div className="flex items-center gap-2">
              <SearchInput
                placeholder="Search conversations..."
                onSearch={setSearchQuery}
                className="flex-1"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-muted hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="p-4 space-y-4 animate-scale">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                    <MessageSquare className="h-4 w-4" />
                    Source
                  </label>
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">All Sources</option>
                    <option value="widget">Widget</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                    <User className="h-4 w-4" />
                    Message Count
                  </label>
                  <select
                    value={filters.messageCount}
                    onChange={(e) => setFilters(prev => ({ ...prev, messageCount: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="short">Short (1-5)</option>
                    <option value="medium">Medium (6-15)</option>
                    <option value="long">Long (&gt;15)</option>
                  </select>
                </div>
              </Card>
            )}
          </div>

          {/* Conversation List Container */}
          <div className="flex-1 overflow-hidden">
            <div 
              className="h-full overflow-y-auto"
              onScroll={handleScroll}
            >
              <ConversationList
                conversations={filteredConversations}
                selectedId={selectedConversation?.id}
                onSelect={setSelectedConversation}
                onMobileSelect={() => setShowMobileList(false)}
                chatbotId={chatbotId || undefined}
              />
              
              {isLoadingMore && (
                <div className="p-4 text-center text-sm text-muted">
                  Loading more conversations...
                </div>
              )}
              
              {!hasMore && conversations.length > 0 && (
                <div className="p-4 text-center text-sm text-muted">
                  No more conversations to load
                </div>
              )}
            </div>
          </div>
        </div>
      }
      content={
        selectedConversation ? (
          <ConversationDetail 
            conversation={selectedConversation}
            onBack={() => setShowMobileList(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            Select a conversation to view details
          </div>
        )
      }
      showMobileList={showMobileList}
      onMobileListChange={setShowMobileList}
    />
  )
} 