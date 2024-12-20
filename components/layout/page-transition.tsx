'use client'

import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

const variants = {
  hidden: { opacity: 0, x: 0, y: 20 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: 20 }
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.main
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ type: "linear", duration: 0.3 }}
      className="flex min-h-[calc(100vh-4rem)] flex-col"
    >
      {children}
    </motion.main>
  )
} 