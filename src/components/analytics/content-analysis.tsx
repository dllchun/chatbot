import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ContentMetrics } from '@/lib/utils/analytics'
import ReactMarkdown from 'react-markdown'
import { useTranslation } from 'react-i18next'

interface ContentAnalysisProps {
  content: ContentMetrics
}

export function ContentAnalysis({ content }: ContentAnalysisProps) {
  const {t} = useTranslation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("components.analytics.contentAnalysis.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="mb-4 font-medium">{t("components.analytics.contentAnalysis.topUserQueries")}</h4>
            <div className="space-y-2">
              {content.topUserQueries.map(({ query, count }) => (
                <div key={query} className="flex justify-between">
                  <span className="text-sm prose prose-sm max-w-none">
                    <ReactMarkdown>{query}</ReactMarkdown>
                  </span>
                  <span className="text-sm font-medium ml-2">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-medium">{t("components.analytics.contentAnalysis.commonKeywords")}</h4>
            <div className="flex flex-wrap gap-2">
              {content.commonKeywords.map(({ keyword, count }) => (
                <div
                  key={keyword}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs"
                >
                  <ReactMarkdown className="inline">{keyword}</ReactMarkdown> ({count})
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 