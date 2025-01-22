'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Mail, Book, FileText, ExternalLink, Send } from 'lucide-react'

const supportResources = [
  {
    title: 'Documentation',
    description: 'Explore our comprehensive guides and documentation',
    icon: Book,
    href: 'https://docs.i2.ai',
    color: 'bg-blue-500'
  },
  {
    title: 'API Reference',
    description: 'Detailed API documentation for developers',
    icon: FileText,
    href: 'https://docs.i2.ai/api',
    color: 'bg-purple-500'
  },
  {
    title: 'Community Forum',
    description: 'Join our community to discuss and share',
    icon: MessageCircle,
    href: 'https://community.i2.ai',
    color: 'bg-green-500'
  }
]

export default function SupportPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">How can we help you?</h1>
        <p className="text-base sm:text-lg text-muted-foreground px-2">
          Get in touch with our support team or explore our resources
        </p>
      </div>

      {/* Resources Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {supportResources.map((resource) => (
          <a
            key={resource.title}
            href={resource.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="p-4 sm:p-6 h-full transition-all hover:shadow-lg">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className={`${resource.color} p-2 sm:p-3 rounded-lg text-white shrink-0`}>
                  <resource.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-primary truncate">
                    {resource.title}
                    <ExternalLink className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">{resource.description}</p>
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>

      {/* Contact Form */}
      <Card className="p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Contact Support</h2>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="your@email.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="How can we help?" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea 
                placeholder="Describe your issue or question in detail..." 
                className="min-h-[120px] sm:min-h-[150px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div className="text-sm text-muted-foreground">
                <Mail className="w-4 h-4 inline mr-2" />
                You can also email us at{' '}
                <a href="mailto:support@i2.ai" className="text-primary hover:underline">
                  support@i2.ai
                </a>
              </div>
              <Button className="w-full sm:w-auto">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 