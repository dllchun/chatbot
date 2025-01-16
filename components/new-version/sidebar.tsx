'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useClerk, useUser } from '@clerk/nextjs'
import {
  LayoutDashboard,
  MessagesSquare,
  BarChart,
  Settings,
  HelpCircle,
  MessageCircle,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Globe
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

interface MenuItem {
  title: string
  icon: any
  href: string
  external?: boolean
}

const menuItems: MenuItem[] = [
  {
    title: 'components.sidebar.menu.playground',
    icon: LayoutDashboard,
    href: '/playground',
  },
  {
    title: 'components.sidebar.menu.conversations',
    icon: MessagesSquare,
    href: '/conversations',
  },
  {
    title: 'components.sidebar.menu.analytics',
    icon: BarChart,
    href: '/analytics',
  },
  {
    title: 'components.sidebar.menu.settings',
    icon: Settings,
    href: '/settings',
  },
]

const bottomMenuItems: MenuItem[] = [
  {
    title: 'components.sidebar.support.title',
    icon: MessageCircle,
    href: 'https://i2.ai',
    external: true,
  },
  {
    title: 'components.sidebar.support.faq',
    icon: HelpCircle,
    href: 'https://docs.i2.ai',
    external: true,
  },
]

export function NewVersionSidebar({ collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { signOut } = useClerk()
  const { user } = useUser()
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('i18nextLng', lng)
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-[#25212d] text-white transition-all duration-300 fixed md:relative z-50",
      collapsed ? "w-[80px]" : "w-[280px]"
    )}>
      {/* Logo and Collapse Button */}
      <div className="px-6 py-4 mb-4 flex items-center justify-between">
        {!collapsed && (
          <div className="text-xl font-bold flex items-center">
            <span className="text-[#6B4EFF] mr-1">i2</span>
            <span>.ai</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapse(!collapsed)}
          className="text-zinc-400 hover:text-white hover:bg-white/5"
        >
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            collapsed ? "-rotate-90" : "rotate-90"
          )} />
        </Button>
      </div>

      {/* Main Menu */}
      <div className="flex-1 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => (
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-colors relative',
                  'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon size={20} className="shrink-0" />
                {!collapsed && <span className="ml-3">{t(item.title)}</span>}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-colors relative',
                  pathname === item.href
                    ? 'bg-[#6B4EFF]/10 text-[#6B4EFF]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon size={20} className="shrink-0" />
                {!collapsed && <span className="ml-3">{t(item.title)}</span>}
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto px-3 pb-6">
        {/* Support Links */}
        <div className="mb-4">
          {bottomMenuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-colors',
                'text-zinc-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span className="ml-3">{t(item.title)}</span>}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 my-4" />

        {/* Settings Group */}
        <div className="space-y-2">
          {/* Language Selector */}
          {!collapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <Globe className="h-4 w-4" />
                  <span>{i18n.language === 'zh' ? '繁體中文' : 'English'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                className="bg-[#2D2839] border-zinc-700"
              >
                <DropdownMenuItem 
                  onClick={() => changeLanguage('en')}
                  className="text-white hover:bg-white/10 focus:bg-white/10"
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeLanguage('zh')}
                  className="text-white hover:bg-white/10 focus:bg-white/10"
                >
                  繁體中文
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex justify-center"
              onClick={() => changeLanguage(i18n.language === 'en' ? 'zh' : 'en')}
            >
              <Globe className="h-4 w-4" />
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={cn(
              "w-full justify-start gap-2",
              collapsed && "justify-center"
            )}
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4" />
                {!collapsed && <span>{t('common.theme.dark')}</span>}
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                {!collapsed && <span>{t('common.theme.light')}</span>}
              </>
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 my-4" />

        {/* User Section */}
        <div className="space-y-3">
          {user && !collapsed && (
            <div className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback>
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate text-white">
                  {user.fullName}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className={cn(
              "w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>{t('common.actions.signOut')}</span>}
          </Button>
        </div>
      </div>
    </div>
  )
} 