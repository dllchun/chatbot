import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session.userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { keys } = await req.json()
    if (!Array.isArray(keys)) {
      return new NextResponse('Invalid request body', { status: 400 })
    }

    // Read both translation files
    const enPath = path.join(process.cwd(), 'lib/i18n/locales/en.json')
    const zhPath = path.join(process.cwd(), 'lib/i18n/locales/zh.json')
    
    const [enContent, zhContent] = await Promise.all([
      fs.readFile(enPath, 'utf-8'),
      fs.readFile(zhPath, 'utf-8')
    ])

    const en = JSON.parse(enContent)
    const zh = JSON.parse(zhContent)

    // Delete translations
    for (const key of keys) {
      const parts = key.split('.')
      let currentEn = en
      let currentZh = zh
      
      // Navigate to the parent object
      for (let i = 0; i < parts.length - 1; i++) {
        currentEn = currentEn[parts[i]]
        currentZh = currentZh[parts[i]]
        if (!currentEn || !currentZh) break
      }
      
      // Delete the key
      if (currentEn && currentZh) {
        const lastPart = parts[parts.length - 1]
        delete currentEn[lastPart]
        delete currentZh[lastPart]
      }
    }

    // Clean up empty objects
    function cleanupEmpty(obj: any) {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          cleanupEmpty(obj[key])
          if (Object.keys(obj[key]).length === 0) {
            delete obj[key]
          }
        }
      }
    }

    cleanupEmpty(en)
    cleanupEmpty(zh)

    // Write back to files
    await Promise.all([
      fs.writeFile(enPath, JSON.stringify(en, null, 2), 'utf-8'),
      fs.writeFile(zhPath, JSON.stringify(zh, null, 2), 'utf-8')
    ])

    return new NextResponse('Translations deleted successfully', { status: 200 })
  } catch (error) {
    console.error('Error deleting translations:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 