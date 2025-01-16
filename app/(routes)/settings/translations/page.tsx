'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/new-version/page-container'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Save, ChevronRight, Download, Upload, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@clerk/nextjs'

interface TranslationEntry {
  key: string
  en: string
  zh: string
  namespace: string
  section: string
  isNew?: boolean
  status?: 'complete' | 'incomplete'
}

function flattenTranslations(obj: any, prefix = '', namespace = '', result: TranslationEntry[] = [], isZh = false): TranslationEntry[] {
  if (!obj || typeof obj !== 'object') return result

  for (const key in obj) {
    const newPrefix = prefix ? `${prefix}.${key}` : key
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      flattenTranslations(obj[key], newPrefix, namespace || key, result, isZh)
    } else {
      const parts = newPrefix.split('.')
      const section = parts.slice(0, -1).join('.')
      const existingEntry = result.find(entry => entry.key === newPrefix)
      
      if (existingEntry) {
        if (isZh) {
          existingEntry.zh = obj[key]
        } else {
          existingEntry.en = obj[key]
        }
        // Update status whenever we modify an entry
        existingEntry.status = (existingEntry.en && existingEntry.zh) ? 'complete' as const : 'incomplete' as const
      } else {
        // Create new entry for either language
        const newEntry: TranslationEntry = {
          key: newPrefix,
          en: isZh ? '' : obj[key],
          zh: isZh ? obj[key] : '',
          namespace: namespace || parts[0],
          section,
          status: 'incomplete' as const
        }
        result.push(newEntry)
      }
    }
  }
  return result
}

function unflattenTranslations(entries: TranslationEntry[]): Record<string, any> {
  const result: Record<string, any> = {}
  
  entries.forEach(entry => {
    const parts = entry.key.split('.')
    let current = result
    
    parts.slice(0, -1).forEach(part => {
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    })
    
    const lastPart = parts[parts.length - 1]
    current[lastPart] = entry.en // or entry.zh depending on the language
  })
  
  return result
}

// Add new interface for category suggestions
interface CategorySuggestion {
  label: string
  description: string
  example: string
}

// Add categories map
const CATEGORY_SUGGESTIONS: CategorySuggestion[] = [
  {
    label: 'common',
    description: 'Shared translations used across multiple pages',
    example: 'common.actions.save, common.buttons.cancel'
  },
  {
    label: 'pages',
    description: 'Page-specific translations',
    example: 'pages.playground.title, pages.settings.description'
  },
  {
    label: 'components',
    description: 'Component-specific translations',
    example: 'components.sidebar.menu.home'
  },
  {
    label: 'language',
    description: 'Language selection related translations',
    example: 'language.select, language.en'
  },
  {
    label: 'export',
    description: 'Export related translations',
    example: 'export.csv.label, export.excel.description'
  }
]

// Add interface for duplicate detection
interface DuplicateGroup {
  text: string
  entries: TranslationEntry[]
}

// Enhance the findSimilarTranslations function
function findSimilarTranslations(value: string, translations: TranslationEntry[], threshold: number = 0.8): {
  exactDuplicates: DuplicateGroup[]
  similarTranslations: TranslationEntry[]
} {
  if (!value.trim()) return { exactDuplicates: [], similarTranslations: [] }
  
  const normalizeString = (str: string) => str.toLowerCase().trim()
  const value_normalized = normalizeString(value)
  
  // Find exact duplicates first
  const exactDuplicatesMap = new Map<string, TranslationEntry[]>()
  translations.forEach(t => {
    if (t.en && normalizeString(t.en) === value_normalized) {
      const key = t.en
      if (!exactDuplicatesMap.has(key)) {
        exactDuplicatesMap.set(key, [])
      }
      exactDuplicatesMap.get(key)!.push(t)
    }
  })
  
  const exactDuplicates: DuplicateGroup[] = Array.from(exactDuplicatesMap.entries())
    .map(([text, entries]) => ({ text, entries }))
    .filter(group => group.entries.length > 0)
  
  // Then find similar translations
  const similarTranslations = translations.filter(t => {
    if (!t.en || !t.zh) return false
    
    const en_normalized = normalizeString(t.en)
    const zh_normalized = normalizeString(t.zh)
    
    // Exclude exact matches as they're handled separately
    if (en_normalized === value_normalized) return false
    
    const isEnglishSimilar = en_normalized.includes(value_normalized) || 
                            value_normalized.includes(en_normalized) ||
                            levenshteinSimilarity(en_normalized, value_normalized) > threshold
    
    const isChineseSimilar = zh_normalized.includes(value_normalized) ||
                            value_normalized.includes(zh_normalized)
    
    return isEnglishSimilar || isChineseSimilar
  })
  
  return { exactDuplicates, similarTranslations }
}

// Levenshtein distance similarity ratio
function levenshteinSimilarity(a: string, b: string): number {
  if (a.length === 0 || b.length === 0) return 0
  
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null))
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      )
    }
  }
  
  const distance = matrix[b.length][a.length]
  const maxLength = Math.max(a.length, b.length)
  return 1 - distance / maxLength
}

// Add a reusable checkbox style class
const checkboxStyles = "h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors hover:border-primary-500"

export default function TranslationsPage() {
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all')
  const [translations, setTranslations] = useState<TranslationEntry[]>([])
  const [editedTranslations, setEditedTranslations] = useState<Record<string, { en: string; zh: string; key?: string }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showNewTranslation, setShowNewTranslation] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [sortBy, setSortBy] = useState<'key' | 'status'>('key')
  const [similarTranslations, setSimilarTranslations] = useState<Record<string, TranslationEntry[]>>({})
  const [exactDuplicates, setExactDuplicates] = useState<Record<string, DuplicateGroup[]>>({})
  const [selectedTranslations, setSelectedTranslations] = useState<Set<string>>(new Set())

  const loadTranslations = async () => {
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('No auth token available')
      }

      const response = await fetch('/api/translations', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch translations')
      }
      
      const { en, zh } = await response.json()
      
      // First flatten English translations
      const flattened = flattenTranslations(en, '', '', [], false)
      
      // Then flatten Chinese translations and merge them
      flattenTranslations(zh, '', '', flattened, true)
      
      // Update status for all entries
      const withStatus = flattened.map(entry => ({
        ...entry,
        status: entry.zh && entry.en ? ('complete' as const) : ('incomplete' as const)
      }))
      
      setTranslations(withStatus)
    } catch (error) {
      console.error('Error loading translations:', error)
      toast.error('Failed to load translations')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTranslations()
  }, [])

  const addNewTranslation = () => {
    // Check if there's already an unsaved new translation
    const hasUnsavedNew = translations.some(t => t.isNew && t.key === '')
    if (hasUnsavedNew) {
      toast.error('Please save or complete the current new translation first')
      return
    }

    const newEntry: TranslationEntry = {
      key: '',
      en: '',
      zh: '',
      namespace: selectedNamespace === 'all' ? 'common' : selectedNamespace,
      section: '',
      isNew: true
    }
    setTranslations([newEntry, ...translations])
    setShowNewTranslation(true)
  }

  const handleEdit = (key: string, field: 'en' | 'zh' | 'key', value: string) => {
    if (field === 'key') {
      const entry = translations.find(t => t.isNew && t.key === '')
      if (entry) {
        const parts = value.split('.')
        entry.namespace = parts[0] || 'common'
        entry.section = parts.slice(0, -1).join('.')
      }
    }
    
    // Check for duplicates when editing text
    if (field === 'en' || field === 'zh') {
      const normalizedValue = value.toLowerCase().trim()
      if (normalizedValue) {
        const duplicates = translations.filter(t => {
          const textToCompare = field === 'en' ? t.en : t.zh
          return t.key !== key && 
                 textToCompare?.toLowerCase().trim() === normalizedValue
        })

        if (duplicates.length > 0) {
          const duplicateKeys = duplicates.map(d => d.key).join(', ')
          toast.error(`Warning: "${value}" is already used in: ${duplicateKeys}`, {
            duration: 6000,
            position: 'top-center',
          })
        }
      }
    }
    
    setEditedTranslations(prev => {
      const existingEntry = translations.find(t => t.key === key)
      const currentEdit = prev[key] || {}
      
      return {
        ...prev,
        [key]: {
          en: field === 'en' ? value : (currentEdit.en ?? existingEntry?.en ?? ''),
          zh: field === 'zh' ? value : (currentEdit.zh ?? existingEntry?.zh ?? ''),
          key: field === 'key' ? value : (currentEdit.key ?? key)
        }
      }
    })
  }

  const validateTranslations = () => {
    setIsValidating(true)
    const errors: Record<string, string[]> = {}
    const duplicateTracker = new Map<string, string[]>()

    // Track all translations for duplicates
    translations.forEach(entry => {
      if (entry.en) {
        const normalized = entry.en.toLowerCase().trim()
        if (!duplicateTracker.has(normalized)) {
          duplicateTracker.set(normalized, [])
        }
        duplicateTracker.get(normalized)!.push(entry.key)
      }
    })

    // Check edited translations
    Object.entries(editedTranslations).forEach(([key, value]) => {
      const currentErrors: string[] = []
      
      // Check for empty values
      if (!value.en?.trim() && value.key) {
        currentErrors.push('English translation is required')
      }
      if (!value.zh?.trim()) {
        currentErrors.push('Chinese translation is required')
      }
      
      // Check for invalid key format
      if (value.key && !/^[a-z0-9]+(?:\.[a-z0-9]+)*$/i.test(value.key)) {
        currentErrors.push('Invalid key format. Use only letters, numbers, and dots')
      }
      
      // Check for duplicate keys
      const isDuplicateKey = translations.some(t => 
        t.key === value.key && t.key !== key
      )
      if (isDuplicateKey) currentErrors.push('This key already exists')

      // Check for duplicate text
      if (value.en) {
        const normalized = value.en.toLowerCase().trim()
        const duplicateKeys = duplicateTracker.get(normalized) || []
        const otherDuplicates = duplicateKeys.filter(k => k !== key)
        if (otherDuplicates.length > 0) {
          currentErrors.push(`Duplicate text "${value.en}" found in: ${otherDuplicates.join(', ')}`)
        }
      }
      
      if (currentErrors.length > 0) {
        errors[key] = currentErrors
      }
    })

    // Show toast for any duplicates
    duplicateTracker.forEach((keys, text) => {
      if (keys.length > 1) {
        toast.error(`Warning: "${text}" is used in multiple places: ${keys.join(', ')}`, {
          duration: 6000,
          position: 'top-center',
        })
      }
    })

    setValidationErrors(errors)
    setIsValidating(false)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateTranslations()) {
      // Only validate format errors, not completeness
      const formatErrors = Object.entries(validationErrors).some(([_, errors]) => 
        errors.some(error => error.includes('Invalid key format') || error.includes('This key already exists'))
      )
      
      if (formatErrors) {
        toast.error('Please fix validation errors before saving')
        return
      }
    }

    try {
      const token = await getToken()
      if (!token) {
        throw new Error('No auth token available')
      }

      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          changes: editedTranslations,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save translations')
      }

      toast.success('Translations saved successfully')
      setEditedTranslations({})
      
      // Reload translations to get the latest changes
      loadTranslations()
    } catch (error) {
      console.error('Error saving translations:', error)
      toast.error('Failed to save translations')
    }
  }

  const handleExport = () => {
    const data = {
      en: unflattenTranslations(translations.map(t => ({ ...t, en: editedTranslations[t.key]?.en ?? t.en }))),
      zh: unflattenTranslations(translations.map(t => ({ ...t, zh: editedTranslations[t.key]?.zh ?? t.zh }))),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `translations_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = JSON.parse(e.target?.result as string)
        if (!content.en || !content.zh) {
          throw new Error('Invalid translation file format')
        }

        // Merge imported translations with existing ones
        const importedTranslations = flattenTranslations(content.en)
        importedTranslations.forEach(entry => {
          entry.zh = content.zh[entry.key] || ''
        })

        setTranslations(importedTranslations)
        toast.success('Translations imported successfully')
      } catch (error) {
        console.error('Error importing translations:', error)
        toast.error('Failed to import translations')
      }
    }
    reader.readAsText(file)
  }

  const namespaces = ['all', ...new Set(translations.map(t => t.namespace))]
  
  const sortTranslations = (translations: TranslationEntry[]) => {
    return [...translations].sort((a, b) => {
      if (sortBy === 'status') {
        // Sort incomplete entries first
        if (a.status === 'incomplete' && b.status === 'complete') return -1
        if (a.status === 'complete' && b.status === 'incomplete') return 1
      }
      // Fall back to sorting by key
      return a.key.localeCompare(b.key)
    })
  }

  const filteredTranslations = sortTranslations(
    translations.filter(t => {
      const matchesSearch = searchQuery.toLowerCase() === '' ||
        t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.zh.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesNamespace = selectedNamespace === 'all' || t.namespace === selectedNamespace
      
      return matchesSearch && matchesNamespace
    })
  )

  const incompleteCount = translations.filter(t => t.status === 'incomplete').length

  const handleDelete = async (keys: string[]) => {
    if (!keys.length) return
    
    const confirmMessage = keys.length === 1 
      ? 'Are you sure you want to delete this translation?' 
      : `Are you sure you want to delete ${keys.length} translations?`
      
    if (!confirm(confirmMessage)) return

    try {
      const token = await getToken()
      if (!token) {
        throw new Error('No auth token available')
      }

      const response = await fetch('/api/translations/delete', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ keys }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete translations')
      }

      toast.success(keys.length === 1 ? 'Translation deleted' : 'Translations deleted')
      loadTranslations()
      setSelectedTranslations(new Set())
    } catch (error) {
      console.error('Error deleting translations:', error)
      toast.error('Failed to delete translations')
    }
  }

  return (
    <div className="px-6">
      <Card className="p-6">
        <div className="sticky top-0 bg-white z-10 pb-6">
          <div className="flex gap-4">
            {selectedTranslations.size > 0 && (
              <div className="flex items-center gap-2 px-2 py-1 bg- rounded-md">
                <span className="text-sm text-muted-foreground">
                  {selectedTranslations.size} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(Array.from(selectedTranslations))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </Button>
              </div>
            )}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search translations..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedNamespace}
              onValueChange={setSelectedNamespace}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select namespace" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-md">
                {namespaces.map((namespace) => (
                  <SelectItem key={namespace} value={namespace}>
                    {namespace}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value: 'key' | 'status') => setSortBy(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-md">
                <SelectItem value="key">Sort by Key</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={addNewTranslation}>
                <Plus className="w-4 h-4 mr-2" />
                New Translation
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={Object.keys(editedTranslations).length === 0}
                className="relative"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
                {incompleteCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {incompleteCount}
                  </span>
                )}
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <div className="relative">
                <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <input
                  type="file"
                  id="import-file"
                  className="hidden"
                  accept=".json"
                  onChange={handleImport}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border overflow-auto max-h-[calc(100vh-16rem)]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 border-b">
              <TableRow className="hover:bg-slate-50/50">
                <TableHead className="w-[300px]">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTranslations.size === filteredTranslations.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTranslations(new Set(filteredTranslations.map(t => t.key)))
                        } else {
                          setSelectedTranslations(new Set())
                        }
                      }}
                      className={cn(
                        checkboxStyles,
                        "mr-2"
                      )}
                    />
                    Key
                  </div>
                </TableHead>
                <TableHead>English</TableHead>
                <TableHead>
                  Chinese
                  {incompleteCount > 0 && (
                    <span className="ml-2 text-xs text-red-500">
                      ({incompleteCount} missing)
                    </span>
                  )}
                </TableHead>
                <TableHead className="w-[50px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTranslations.map((entry) => (
                <TableRow 
                  key={entry.key || 'new'}
                  className={cn(
                    "group hover:bg-slate-50/50 transition-colors",
                    entry.status === 'incomplete' && !entry.isNew && 'bg-red-50/30 hover:bg-red-50/40'
                  )}
                >
                  <TableCell className="font-mono text-sm">
                    {entry.isNew ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter translation key (e.g., common.button.save)"
                          value={editedTranslations[entry.key]?.key ?? entry.key}
                          onChange={(e) => handleEdit(entry.key, 'key', e.target.value)}
                          className={cn(
                            "font-mono",
                            validationErrors[entry.key]?.includes('Invalid key format') && 'border-red-500'
                          )}
                        />
                        {validationErrors[entry.key]?.map((error, i) => (
                          <p key={i} className="text-xs text-red-500 mt-1">{error}</p>
                        ))}
                        
                        <Select
                          value={editedTranslations[entry.key]?.key?.split('.')[0] || ''}
                          onValueChange={(value) => {
                            const currentValue = editedTranslations[entry.key]?.key ?? ''
                            const currentParts = currentValue.split('.')
                            const newValue = currentParts.length > 1 
                              ? `${value}.${currentParts.slice(1).join('.')}` 
                              : `${value}.`
                            handleEdit(entry.key, 'key', newValue)
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border shadow-md">
                            {CATEGORY_SUGGESTIONS.map((category) => (
                              <SelectItem key={category.label} value={category.label}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{category.label}</span>
                                  <span className="text-xs text-muted-foreground">{category.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedTranslations.has(entry.key)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedTranslations)
                              if (e.target.checked) {
                                newSelected.add(entry.key)
                              } else {
                                newSelected.delete(entry.key)
                              }
                              setSelectedTranslations(newSelected)
                            }}
                            className={cn(
                              checkboxStyles,
                              "mr-2"
                            )}
                          />
                          <div className="flex items-center">
                            <span className="text-muted-foreground">{entry.namespace}</span>
                            <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
                            <span>{entry.key.split('.').slice(1).join('.')}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete([entry.key])}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50/50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500/70 hover:text-red-600" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Input
                        value={editedTranslations[entry.key]?.en ?? entry.en}
                        onChange={(e) => handleEdit(entry.key, 'en', e.target.value)}
                        className={cn(
                          editedTranslations[entry.key]?.en !== undefined && 'border-blue-500',
                          (validationErrors[entry.key]?.some(error => 
                            error.includes('English translation is required') || 
                            error.includes('English text already exists')
                          )) && 'border-red-500',
                          exactDuplicates[entry.key]?.length > 0 && 'border-red-500'
                        )}
                        placeholder={entry.isNew ? "Enter English translation" : ""}
                      />
                      
                      {/* Show validation errors */}
                      {validationErrors[entry.key]?.map((error, i) => (
                        error.includes('English') && (
                          <p key={i} className="text-xs text-red-500 mt-1">{error}</p>
                        )
                      ))}
                      
                      {/* Show exact duplicates with warning */}
                      {exactDuplicates[entry.key]?.length > 0 && (
                        <div className="mt-2 p-2 rounded-md border border-red-200 bg-red-50">
                          <p className="text-sm font-medium text-red-700 mb-1">⚠️ Exact duplicates found:</p>
                          <div className="space-y-1">
                            {exactDuplicates[entry.key].map((group, index) => (
                              <div key={index} className="text-xs">
                                <p className="font-medium text-red-800">The text "{group.text}" is already used in:</p>
                                {group.entries.map((similar, i) => (
                                  <div key={i} className="ml-2 mt-1">
                                    <div className="flex justify-between items-center">
                                      <span className="font-mono text-red-800">{similar.key}</span>
                                      <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          handleEdit(entry.key, 'en', similar.en)
                                          handleEdit(entry.key, 'zh', similar.zh)
                                        }}
                                      >
                                        Use this
                                      </button>
                                    </div>
                                    <div className="text-red-700">ZH: {similar.zh}</div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Show similar translations */}
                      {similarTranslations[entry.key]?.length > 0 && (
                        <div className="mt-2 p-2 rounded-md border border-yellow-200 bg-yellow-50">
                          <p className="text-sm font-medium text-yellow-700 mb-1">Similar translations found:</p>
                          <div className="space-y-1">
                            {similarTranslations[entry.key].map((similar, index) => (
                              <div key={index} className="text-xs">
                                <div className="flex justify-between">
                                  <span className="font-mono text-yellow-800">{similar.key}</span>
                                  <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => {
                                      handleEdit(entry.key, 'en', similar.en)
                                      handleEdit(entry.key, 'zh', similar.zh)
                                    }}
                                  >
                                    Use this
                                  </button>
                                </div>
                                <div className="text-yellow-700">EN: {similar.en}</div>
                                <div className="text-yellow-700">ZH: {similar.zh}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Input
                        value={editedTranslations[entry.key]?.zh ?? entry.zh}
                        onChange={(e) => handleEdit(entry.key, 'zh', e.target.value)}
                        className={cn(
                          editedTranslations[entry.key]?.zh !== undefined && 'border-blue-500',
                          (validationErrors[entry.key]?.some(error => 
                            error.includes('Chinese translation is required') || 
                            error.includes('Chinese text already exists') ||
                            error.includes('Missing Chinese translation')
                          )) && 'border-red-500'
                        )}
                        placeholder={entry.isNew ? "Enter Chinese translation" : ""}
                      />
                      {/* Show validation errors */}
                      {validationErrors[entry.key]?.map((error, i) => (
                        error.includes('Chinese') && (
                          <p key={i} className="text-xs text-red-500 mt-1">{error}</p>
                        )
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center",
                      entry.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                      {entry.status === 'complete' ? 'Complete' : 'Incomplete'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
} 