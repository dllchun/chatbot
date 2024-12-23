import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Header } from '@/components/layout/header'
import { PageTransition } from '@/components/layout/page-transition'
import { Suspense } from 'react'
import { LoadingPage } from '@/components/ui/loading'
import { Toaster } from 'sonner'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    signInFallbackRedirectUrl="/conversations"
    signUpFallbackRedirectUrl="/conversations"
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider>
            <div className="relative flex min-h-screen flex-col bg-background">
              <Header />
              <Suspense fallback={<LoadingPage />}>
                <PageTransition>{children}</PageTransition>
              </Suspense>
            </div>
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
