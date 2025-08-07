import { NextResponse, NextRequest } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { auth } from '@clerk/nextjs/server'

export const runtime = 'nodejs';

interface TranslationChanges {
  [key: string]: {
    en: string
    zh: string
    key?: string
  }
}

// Helper function to check authentication
async function checkAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }

  const session = await auth()
  if (!session.userId) {
    throw new Error('Unauthorized')
  }
  return session.userId
}

function updateTranslations(obj: any, key: string, value: string) {
  const parts = key.split('.')
  let current = obj
  
  // Navigate through the object structure
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!current[part]) {
      current[part] = {}
    }
    current = current[part]
  }
  
  // Set the value at the final key
  const lastPart = parts[parts.length - 1]
  current[lastPart] = value
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication first
    await checkAuth(req)
    
    const { changes } = await req.json() as { changes: TranslationChanges }
    
    // Get the paths to the translation files
    const i18nDir = path.join(process.cwd(), 'lib/i18n/locales')
    const enPath = path.join(i18nDir, 'en.json')
    const zhPath = path.join(i18nDir, 'zh.json')
    
    // Read current translations
    const [enContent, zhContent] = await Promise.all([
      fs.readFile(enPath, 'utf-8'),
      fs.readFile(zhPath, 'utf-8')
    ])
    
    const enTranslations = JSON.parse(enContent)
    const zhTranslations = JSON.parse(zhContent)
    
    // Apply changes
    Object.entries(changes).forEach(([key, value]) => {
      const targetKey = value.key || key
      if (value.en) updateTranslations(enTranslations, targetKey, value.en)
      if (value.zh) updateTranslations(zhTranslations, targetKey, value.zh)
    })
    
    // Write back to files
    await Promise.all([
      fs.writeFile(enPath, JSON.stringify(enTranslations, null, 2), 'utf-8'),
      fs.writeFile(zhPath, JSON.stringify(zhTranslations, null, 2), 'utf-8')
    ])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving translations:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to save translations' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication first
    await checkAuth(req)
    
    const i18nDir = path.join(process.cwd(), 'lib/i18n/locales')
    const [enContent, zhContent] = await Promise.all([
      fs.readFile(path.join(i18nDir, 'en.json'), 'utf-8'),
      fs.readFile(path.join(i18nDir, 'zh.json'), 'utf-8')
    ])
    
    return NextResponse.json({
      en: JSON.parse(enContent),
      zh: JSON.parse(zhContent)
    })
  } catch (error) {
    console.error('Error fetching translations:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    )
  }
} 