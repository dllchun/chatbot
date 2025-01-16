'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ConversationList } from '@/components/conversations/conversation-list'
import { ConversationDetail } from '@/components/conversations/conversation-detail'
import { SearchInput } from '@/components/ui/search-input'
import { Card } from '@/components/ui/card'
import { Filter, Calendar, MessageSquare, User, AlertCircle } from 'lucide-react'
import { LoadingPage } from '@/components/ui/loading'
import type { Conversation } from '@/types/api'
import { ChatbotRequired } from '@/components/ui/chatbot-required'
import { useRouter } from 'next/navigation'
import { useChatbotPreference } from '@/lib/hooks/useChatbotPreference'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { PageContainer } from '@/components/new-version/page-container'
import { useTranslation } from 'react-i18next'

export default function ConversationsPage() {
  const { t } = useTranslation()
  const { chatbotId, isConfigured, isLoading: isPreferenceLoading, isInitialized } = useChatbotPreference()
  const { getToken } = useAuth()
  const router = useRouter()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileList, setShowMobileList] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
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

  // Wait for preference to be initialized before fetching conversations
  useEffect(() => {
    if (!isInitialized || isPreferenceLoading) {
      return
    }

    if (!chatbotId) {
      setError('Please configure your Chatbot ID in settings')
      setLoading(false)
      return
    }

    fetchConversations(1, false)
  }, [chatbotId, isInitialized, isPreferenceLoading])

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



    return matchesSearch && matchesMessageCount
  })



  if (!isConfigured) {
    return <ChatbotRequired />
  }

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="rounded-lg bg-red-50 p-4 text-red-500">
          {error}
        </div>
      </div>
    )
  }

  return (
    <PageContainer
      title={t('components.sidebar.menu.conversations')}
      description={t('pages.conversations.description')}
      headerContent={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "transition-colors",
            showFilters && "bg-primary/10 text-primary border-primary"
          )}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      }
      fullWidth
    >
      <div className="h-full flex flex-col md:flex-row">
        {/* Conversation List Section */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r border-border bg-background flex-shrink-0",
          "transition-all duration-200 ease-in-out",
          !showMobileList && "hidden md:block",
          showMobileList && "absolute md:relative inset-0 z-20 md:z-0 bg-background"
        )}>
          <div className="h-full flex flex-col">
            {/* Search Header */}
            <div className="flex-none border-b p-4 bg-background">
              <SearchInput
                placeholder={t("pages.conversations.searchPlaceholder")}
                onSearch={setSearchQuery}
                className="w-full"
              />
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="flex-none border-b p-4 bg-background">
                <Card className="p-4 space-y-4 animate-in fade-in-50 slide-in-from-top-5">
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
              </div>
            )}

            {/* Conversation List */}
            <div className="flex-1 overflow-hidden">
              <div 
                className="h-full overflow-y-auto"
                onScroll={handleScroll}
              >
                <ConversationList
                  conversations={filteredConversations}
                  selectedId={selectedConversation?.id}
                  onSelect={(conv) => {
                    setSelectedConversation(conv)
                    setShowMobileList(false)
                  }}
                  chatbotId={chatbotId || undefined}
                />
                
                {isLoadingMore && (
                  <div className="p-4 text-center">
                    <Spinner className="h-6 w-6 mx-auto" />
                  </div>
                )}
                
                {!hasMore && conversations.length > 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No more conversations to load
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Detail Section */}
        <div className={cn(
          "flex-1 h-full bg-background",
          showMobileList && "hidden md:block"
        )}>
          {selectedConversation ? (
            <ConversationDetail 
              conversation={selectedConversation}
              onBack={() => setShowMobileList(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t("common.selectConversation")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
} 