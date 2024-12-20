'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

type SyncStatus = {
  chatbot_id: string
  last_synced_at: string
  last_sync_count: number
  created_at: string
  updated_at: string
}

export default function SyncStatusPage() {
  const { getToken } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const TEST_CONFIG = {
    CHATBOT_ID: 'PTnQaHCF4UkuO5mxwItxv',
  }

  const fetchSyncStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = await getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }

      console.log('Fetching sync status...')
      const response = await fetch('/api/sync-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      console.log('Response status:', response.status)
      const responseText = await response.text()
      console.log('Response text:', responseText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`)
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Error parsing JSON:', e)
        throw new Error('Invalid JSON response')
      }

      console.log('Sync status data:', data)
      setSyncStatus(data)
    } catch (err) {
      console.error('Error fetching sync status:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch sync status')
    } finally {
      setLoading(false)
    }
  }

  const triggerSync = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = await getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Trigger a force sync by adding forceSync=true
      const response = await fetch(`/api/conversations?chatbotId=${TEST_CONFIG.CHATBOT_ID}&forceSync=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await fetchSyncStatus() // Refresh the status after sync
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger sync')
    } finally {
      setLoading(false)
    }
  }

  const insertTestData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = await getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }

      console.log('Inserting test data...')
      const response = await fetch('/api/sync-status/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`)
      }

      const data = await response.json()
      console.log('Test data inserted:', data)

      await fetchSyncStatus() // Refresh the status after inserting test data
    } catch (err) {
      console.error('Error inserting test data:', err)
      setError(err instanceof Error ? err.message : 'Failed to insert test data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSyncStatus()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sync Status Monitor</h1>
      
      <div className="mb-4 space-x-2">
        <button
          onClick={triggerSync}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Syncing...' : 'Trigger Manual Sync'}
        </button>

        <button
          onClick={fetchSyncStatus}
          disabled={loading}
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Status'}
        </button>

        <button
          onClick={insertTestData}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Inserting...' : 'Insert Test Data'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chatbot ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Synced</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sync Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {syncStatus.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No sync status records found
                </td>
              </tr>
            ) : (
              syncStatus.map((status) => (
                <tr key={status.chatbot_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {status.chatbot_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(status.last_synced_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {status.last_sync_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(status.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(status.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
} 