import { MessageSquare, PlayCircle, BarChart2, Settings } from 'lucide-react'

export const siteConfig = {
  name: 'Chatbot Management System',
  description: 'A system to manage chatbot conversations and analytics',
  navigation: [
    {
      name: 'Conversations',
      href: '/conversations',
      icon: MessageSquare,
    },
    {
      name: 'Playground',
      href: '/playground',
      icon: PlayCircle,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart2,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ],
  api: {
    chatbase: {
      url: 'https://www.chatbase.co/api/v1',
      version: 'v1',
    },
  },
} 