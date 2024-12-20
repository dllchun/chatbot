import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DistributionItem {
  key: string
  value: number
  label?: string
}

interface DistributionCardProps {
  title: string
  items: DistributionItem[]
}

export function DistributionCard({ title, items }: DistributionCardProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center">
              <div className="w-24 flex-shrink-0 sm:w-40">
                <p className="text-sm font-medium capitalize">{item.key}</p>
                {item.label && (
                  <p className="text-xs text-muted">{item.label}</p>
                )}
              </div>
              <div className="flex-1">
                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ 
                      width: total > 0 ? `${(item.value / total) * 100}%` : '0%'
                    }}
                  />
                </div>
              </div>
              <div className="ml-4 w-12 text-right">
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 