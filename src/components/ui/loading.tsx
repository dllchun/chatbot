"use client"

import  {motion}  from "framer-motion"
import { Card } from "@/components/ui/card"

export  function LoadingDots() {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="h-2 w-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: dot * 0.1,
          }}
        />
      ))}
    </div>
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <motion.div
      className={`inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        ease: "linear",
        repeat: Infinity,
      }}
    />
  )
}

export function LoadingPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LoadingSpinner className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted">Loading...</p>
      </motion.div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
      </div>
    </Card>
  )
}

export function LoadingSkeleton() {
  return (
    <motion.div
      className="h-full w-full rounded-lg bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"
      animate={{
        backgroundPosition: ["200% 0", "-200% 0"],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
} 