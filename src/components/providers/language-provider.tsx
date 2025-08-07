'use client'

import { useEffect } from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from '@/lib/i18n/locales/en.json'
import zhTranslations from '@/lib/i18n/locales/zh.json'

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      zh: {
        translation: zhTranslations
      }
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

interface LanguageProviderProps {
  children: React.ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  useEffect(() => {
    // Get saved language preference from localStorage
    const savedLanguage = localStorage.getItem('i18nextLng')
    if (savedLanguage && i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage)
    }
  }, [])

  return <>{children}</>
} 