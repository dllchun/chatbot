import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  title?: string
  description?: string
  headerContent?: React.ReactNode
  className?: string
  contentClassName?: string
  fullWidth?: boolean
}

export function PageContainer({ 
  children,
  title,
  description,
  headerContent,
  className,
  contentClassName,
  fullWidth
}: PageContainerProps) {
  return (
    <div className={cn(
      "h-[calc(100vh-2rem)] flex flex-col",
      className
    )}>
      {/* Header */}
      {(title || description || headerContent) && (
        <div className="flex-none px-6 py-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-semibold text-foreground">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            {headerContent && (
              <div className="flex items-center gap-4">
                {headerContent}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "flex-1 overflow-auto",
        fullWidth ? "p-0" : "p-6",
        contentClassName
      )}>
        {children}
      </div>
    </div>
  )
} 