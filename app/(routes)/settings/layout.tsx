'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Settings, Globe } from 'lucide-react'
import { useTranslation } from 'next-i18next'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const pathname = usePathname()

  const settingsNavItems = [
    {
      title: t("pages.settings.sections.general"),
      href: '/settings',
      icon: Settings,
    },
    {
      title: t("pages.settings.sections.translations"),
      href: '/settings/translations',
      icon: Globe,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="border-b">
        <nav className="flex space-x-4 px-6">
          {settingsNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors hover:text-foreground',
                  pathname === item.href
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {children}
    </div>
  )
} 