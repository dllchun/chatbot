import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className="flex-1 p-6">
      <div className={cn(
        "bg-[#f8f8fb] h-full rounded-xl shadow-2xl overflow-hidden",
        className
      )}>
        <main className="h-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 