const getConfig = () => {
  // Server-side environment variables
  if (typeof window === 'undefined') {
    console.log('Server-side environment variables:', {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[exists]' : '[missing]',
      CHATBASE_API_KEY: process.env.CHATBASE_API_KEY ? '[exists]' : '[missing]'
    })
    return {
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      chatbase: {
        apiKey: process.env.CHATBASE_API_KEY,
      },
    }
  }
  
  // Client-side environment variables
  return {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    chatbase: {
      apiKey: undefined, // API key should never be exposed to client
    },
  }
}

export const config = getConfig()

// Validate server-side environment variables only when needed
export const validateServerConfig = () => {
  console.log('Validating server config:', {
    url: config.supabase.url ? '[exists]' : '[missing]',
    anonKey: config.supabase.anonKey ? '[exists]' : '[missing]',
    chatbaseApiKey: config.chatbase.apiKey ? '[exists]' : '[missing]'
  })
  
  if (!config.supabase.url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  if (!config.supabase.anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  if (!config.chatbase.apiKey) throw new Error('CHATBASE_API_KEY is required')
} 