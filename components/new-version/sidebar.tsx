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
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'

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
    title: 'Playground',
    icon: LayoutDashboard,
    href: '/playground',
  },
  {
    title: 'Conversations',
    icon: MessagesSquare,
    href: '/conversations',
  },
  {
    title: 'Analytics',
    icon: BarChart,
    href: '/analytics',
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
  },
]

const bottomMenuItems: MenuItem[] = [
  {
    title: 'Support',
    icon: MessageCircle,
    href: 'https://i2.ai',
    external: true,
  },
  {
    title: 'FAQ',
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
      <nav className="flex-1 px-4 overflow-y-auto">
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
                {!collapsed && <span className="ml-3">{item.title}</span>}
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
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            )
          ))}
        </div>
      </nav>

      {/* Bottom Menu */}
      <div className="px-4 space-y-2 mb-6">
        {bottomMenuItems.map((item) => (
          item.external ? (
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
              {!collapsed && <span className="ml-3">{item.title}</span>}
            </a>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-[#6B4EFF]/10 text-[#6B4EFF]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span className="ml-3">{item.title}</span>}
            </Link>
          )
        ))}
      </div>

      {/* User Profile */}
      {!collapsed && (
        <div className="px-4 pt-4 border-t border-white/10">
          <div className="px-2">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <p className="text-xs text-zinc-400 truncate">{user?.emailAddresses[0].emailAddress}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-zinc-400 hover:text-white hover:bg-white/5"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 mr-2" />
                ) : (
                  <Moon className="h-4 w-4 mr-2" />
                )}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white hover:bg-white/5"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 