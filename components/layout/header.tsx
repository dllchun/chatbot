"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { Menu, X, Bot, MessageSquare, BarChart2, Settings, Sparkles } from 'lucide-react'

// Types
type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Playground',
    href: '/playground',
    icon: <Bot className="h-4 w-4" />
  },
  {
    label: 'Conversations',
    href: '/conversations',
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: <BarChart2 className="h-4 w-4" />
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-4 w-4" />
  }
]

export function Header() {
  const pathname = usePathname()
  const { user } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/playground" className="flex items-center">
              <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2">
                <Sparkles className="h-5 w-5 text-white" />
                <span className="text-lg font-semibold text-white">
                  i2 Demo
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex sm:flex-1 sm:justify-center">
            <ul className="flex items-center space-x-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-emerald-50 hover:text-emerald-600
                      ${pathname === item.href 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'text-slate-500'
                      }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden items-center space-x-4 rounded-full bg-slate-50 px-4 py-2 sm:flex">
              {user && (
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-slate-500">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
              )}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-10 w-10'
                  }
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:hidden"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium ${
                    pathname === item.href
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center space-x-3 px-3">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'h-10 w-10'
                      }
                    }}
                  />
                  {user && (
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {user.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 