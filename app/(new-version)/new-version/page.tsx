'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  User, 
  Plane, 
  Clock, 
  Youtube,
  Folder,
  Search,
  Plus 
} from 'lucide-react'

const taskCategories = [
  {
    title: 'Work Projects',
    icon: Briefcase,
    count: 24,
    color: 'bg-blue-500',
  },
  {
    title: 'Personal Projects',
    icon: User,
    count: 9,
    color: 'bg-purple-500',
  },
  {
    title: 'Plan Trip',
    icon: Plane,
    count: 14,
    color: 'bg-green-500',
  },
  {
    title: 'Agents Memory',
    icon: Clock,
    count: 7,
    color: 'bg-orange-500',
  },
  {
    title: 'Youtube Planning',
    icon: Youtube,
    count: 4,
    color: 'bg-red-500',
  },
  {
    title: 'Portfolio Tasks',
    icon: Folder,
    count: 45,
    color: 'bg-yellow-500',
  },
]

export default function NewVersionPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">With What You Want To Work Today?</h1>
          <p className="text-sm text-zinc-500 mt-1">Choose Task from List Below Or Create New Shortcut</p>
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm" className="bg-[#6B4EFF] hover:bg-[#5B3EEF] text-white rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Type A Keyword..."
            className="pl-9 bg-white border-zinc-200"
          />
        </div>
      </div>

      {/* Task Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {taskCategories.map((category) => (
          <Card
            key={category.title}
            className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-white border-zinc-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className={`p-3 rounded-xl ${category.color} text-white inline-block group-hover:scale-110 transition-transform`}>
                  <category.icon size={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">{category.title}</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {category.count} Files
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Templates Section */}
      <Card className="mt-8 p-8 bg-zinc-900 text-white rounded-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">
              Start Instantly With <span className="text-[#A4FF8D]">Free</span> AI Templates.
            </h2>
            <p className="text-zinc-400 mt-2">
              Check Our Free Library Of Templates For Any Purpose
            </p>
          </div>
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Type A Keyword..."
              className="pl-9 w-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
            />
          </div>
        </div>
      </Card>
    </div>
  )
} 