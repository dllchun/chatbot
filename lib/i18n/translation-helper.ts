import { i18n } from 'i18next'

export type TranslationNamespace = 'common' | 'pages' | 'components' | 'features'

type RecursiveRecord = {
  [key: string]: string | RecursiveRecord
}

interface TranslationModule {
  default: {
    [key: string]: RecursiveRecord
  }
}

/**
 * Add translations to both language files
 * @param namespace The namespace to add translations to
 * @param key The translation key
 * @param translations Object containing translations for both languages
 */
export async function addTranslation(
  namespace: TranslationNamespace,
  key: string,
  translations: { en: string; zh: string }
) {
  try {
    // Update English translations
    const enModule = (await import('./locales/en.json')) as TranslationModule
    if (!enModule.default[namespace]) {
      enModule.default[namespace] = {}
    }
    const enNamespace = enModule.default[namespace] as RecursiveRecord
    enNamespace[key] = translations.en

    // Update Chinese translations
    const zhModule = (await import('./locales/zh.json')) as TranslationModule
    if (!zhModule.default[namespace]) {
      zhModule.default[namespace] = {}
    }
    const zhNamespace = zhModule.default[namespace] as RecursiveRecord
    zhNamespace[key] = translations.zh

    // In development, you might want to write these changes to the files
    if (process.env.NODE_ENV === 'development') {
      // Note: This would require additional setup to write to files
      console.log('New translations to add:', {
        namespace,
        key,
        translations
      })
    }
  } catch (error) {
    console.error('Error adding translation:', error)
  }
}

/**
 * Guidelines for organizing translations:
 * 
 * 1. Use namespaces to organize translations:
 *    - common: Shared translations used across multiple components
 *    - pages: Page-specific translations
 *    - components: Component-specific translations
 *    - features: Feature-specific translations
 * 
 * 2. Use nested objects for better organization:
 *    {
 *      "common": {
 *        "buttons": {
 *          "submit": "Submit",
 *          "cancel": "Cancel"
 *        }
 *      }
 *    }
 * 
 * 3. Use consistent key naming:
 *    - Use camelCase for keys
 *    - Use dots for nesting: 'common.buttons.submit'
 *    - Use descriptive names
 * 
 * Example usage:
 * await addTranslation('features', 'chatbot.welcome', {
 *   en: 'Welcome to our chatbot!',
 *   zh: '歡迎使用我們的聊天機器人！'
 * })
 */ 