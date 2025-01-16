import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import zh from './locales/zh.json'

// Create a hook to get/set language preference
export const useLanguagePreference = () => {
  const getStoredLanguage = () => {
    if (typeof window === 'undefined') return 'en'
    return localStorage.getItem('language') || 'en'
  }

  const setStoredLanguage = (lang: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('language', lang)
    i18n.changeLanguage(lang)
  }

  return { getStoredLanguage, setStoredLanguage }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh }
    },
    lng: typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n 