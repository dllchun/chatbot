'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// FAQ categories with their questions and answers
const faqData = [
  {
    category: 'Getting Started',
    items: [
      {
        question: 'What is i2.ai chatbot?',
        answer: 'i2.ai chatbot is an AI-powered conversational agent that helps businesses automate customer interactions, provide support, and engage with users 24/7. It uses advanced natural language processing to understand and respond to user queries effectively.'
      },
      {
        question: 'How do I create my first chatbot?',
        answer: 'To create your first chatbot: 1) Sign up for an account, 2) Navigate to the dashboard, 3) Click "Create New Chatbot", 4) Configure your settings and preferences, 5) Train your chatbot with your data, and 6) Deploy it to your preferred platform.'
      },
      {
        question: 'What platforms can I deploy my chatbot on?',
        answer: 'You can deploy your chatbot on various platforms including your website (via widget or iframe), WhatsApp, Facebook Messenger, and other messaging platforms. We provide easy integration options for all supported platforms.'
      }
    ]
  },
  {
    category: 'Features & Capabilities',
    items: [
      {
        question: 'What languages does the chatbot support?',
        answer: 'Our chatbot supports multiple languages including English and Traditional Chinese (繁體中文). You can configure language settings and even have your chatbot automatically detect and respond in the user\'s preferred language.'
      },
      {
        question: 'Can I customize the chatbot\'s appearance?',
        answer: 'Yes, you can fully customize the chatbot\'s appearance including colors, fonts, icons, and chat bubble style. You can also add your logo and brand elements to maintain consistency with your website design.'
      },
      {
        question: 'How does the analytics dashboard work?',
        answer: 'The analytics dashboard provides comprehensive insights into your chatbot\'s performance, including conversation metrics, user engagement rates, popular topics, and response times. You can view trends over time and export data for further analysis.'
      }
    ]
  },
  {
    category: 'Account & Billing',
    items: [
      {
        question: 'What subscription plans are available?',
        answer: 'We offer flexible subscription plans to suit different needs: Free (for testing), Basic (for small businesses), Professional (for growing teams), and Enterprise (for large organizations). Each plan includes different features and conversation limits.'
      },
      {
        question: 'How do I upgrade or downgrade my plan?',
        answer: 'You can change your subscription plan at any time from the Settings > Billing section. When upgrading, you\'ll have immediate access to new features. When downgrading, changes will take effect at the start of your next billing cycle.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit cards (Visa, MasterCard, American Express) and PayPal. For Enterprise plans, we also support wire transfers and purchase orders.'
      }
    ]
  },
  {
    category: 'Security & Privacy',
    items: [
      {
        question: 'How is my data protected?',
        answer: 'We implement industry-standard security measures including end-to-end encryption, secure data storage, and regular security audits. Your data is stored in secure, ISO-certified data centers and is never shared with third parties.'
      },
      {
        question: 'Do you comply with GDPR?',
        answer: 'Yes, we are fully GDPR compliant. We provide tools and features to help you maintain compliance, including data export, deletion requests handling, and privacy policy management.'
      },
      {
        question: 'Can I delete my data?',
        answer: 'Yes, you have full control over your data. You can delete individual conversations, export your data, or completely delete your account and all associated data at any time from the settings panel.'
      }
    ]
  }
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter FAQ items based on search query
  const filteredFAQ = faqData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Frequently Asked Questions</h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-2">
          Find answers to common questions about our platform
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-4 sm:space-y-6">
        {filteredFAQ.map((category) => (
          <Card key={category.category} className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{category.category}</h2>
            <Accordion type="single" collapsible className="w-full">
              {category.items.map((item, index) => (
                <AccordionItem key={index} value={`${category.category}-${index}`}>
                  <AccordionTrigger className="text-left text-sm sm:text-base">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        ))}

        {/* No Results */}
        {filteredFAQ.length === 0 && (
          <Card className="p-4 sm:p-6 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              No questions found matching your search. Try different keywords or{' '}
              <a href="/support" className="text-primary hover:underline">
                contact our support team
              </a>
              .
            </p>
          </Card>
        )}
      </div>

      {/* Contact Support */}
      <div className="mt-8 sm:mt-12 text-center">
        <p className="text-sm sm:text-base text-muted-foreground">
          Can't find what you're looking for?{' '}
          <a href="/support" className="text-primary hover:underline">
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  )
} 