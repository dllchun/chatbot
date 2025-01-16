'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Table, FileJson, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@clerk/nextjs'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chatbotId: string
}

type ExportFormat = 'csv' | 'xlsx' | 'json'

interface ExportOption {
  id: ExportFormat
  label: string
  icon: React.ElementType
  description: string
}

export function ExportDialog({ open, onOpenChange, chatbotId }: ExportDialogProps) {
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)

  const exportOptions: ExportOption[] = [
    {
      id: 'csv',
      label: t('export.csv.label'),
      icon: FileText,
      description: t('export.csv.description')
    },
    {
      id: 'xlsx',
      label: t('export.excel.label'),
      icon: Table,
      description: t('export.excel.description')
    },
    {
      id: 'json',
      label: t('export.json.label'),
      icon: FileJson,
      description: t('export.json.description')
    }
  ]

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(format)
      toast.info('Starting export...')
      
      const token = await getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/conversations/export?chatbotId=${chatbotId}&format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conversations-${format}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Export completed')
      onOpenChange(false)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">{t('common.exportConversations')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {exportOptions.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="flex items-center justify-start gap-4 h-16 px-6 hover:bg-slate-50"
              onClick={() => handleExport(option.id)}
              disabled={isExporting !== null}
            >
              {isExporting === option.id ? (
                <Loader2 className="h-5 w-5 animate-spin shrink-0" />
              ) : (
                <option.icon className="h-5 w-5 shrink-0" />
              )}
              <div className="flex flex-col items-start gap-1 text-left">
                <span className="font-medium text-base">{option.label}</span>
                <span className="text-sm text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 