'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { useLanguagePreference } from '@/lib/i18n'

export function LanguageSelector() {
  const { t } = useTranslation()
  const { getStoredLanguage, setStoredLanguage } = useLanguagePreference()
  const currentLanguage = getStoredLanguage()

  const languages = [
    { code: 'en', label: t('language.en') },
    { code: 'zh', label: t('language.zh') }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {languages.find(lang => lang.code === currentLanguage)?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setStoredLanguage(language.code)}
            className="cursor-pointer"
          >
            {language.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 