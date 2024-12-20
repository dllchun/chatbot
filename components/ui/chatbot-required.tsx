import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ChatbotRequired() {
  const router = useRouter()

  return (
    <div className="container max-w-2xl py-8 space-y-4">
      <Alert className="border-orange-500">
        <AlertCircle className="h-4 w-4 text-orange-500" />
        <AlertTitle className="text-orange-500">Chatbot Configuration Required</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">
            Please configure your Chatbot ID to access this feature. If you don't have a Chatbot ID, 
            please contact your administrator.
          </p>
          <Button 
            onClick={() => router.push('/settings')}
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            Configure Chatbot ID
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
} 