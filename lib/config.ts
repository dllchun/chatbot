const getConfig = () => {
  // Server-side environment variables
  if (typeof window === 'undefined') {
    console.log('Server-side environment variables:', {
      MYSQL_HOST: process.env.MYSQL_HOST ? '[exists]' : '[missing]',
      MYSQL_USER: process.env.MYSQL_USER ? '[exists]' : '[missing]',
      MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? '[exists]' : '[missing]',
      MYSQL_DATABASE: process.env.MYSQL_DATABASE ? '[exists]' : '[missing]',
      CHATBASE_API_KEY: process.env.CHATBASE_API_KEY ? '[exists]' : '[missing]'
    })
    return {
      database: {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT || '3306'
      },
      chatbase: {
        apiKey: process.env.CHATBASE_API_KEY,
      },
    }
  }
  
  // Client-side - no database access
  return {
    database: null,
    chatbase: {
      apiKey: undefined, // API key should never be exposed to client
    },
  }
}

export const config = getConfig()

// Validate server-side environment variables only when needed
export const validateServerConfig = () => {
  console.log('Validating server config:', {
    host: config.database?.host ? '[exists]' : '[missing]',
    user: config.database?.user ? '[exists]' : '[missing]',
    password: config.database?.password ? '[exists]' : '[missing]',
    database: config.database?.database ? '[exists]' : '[missing]',
    chatbaseApiKey: config.chatbase.apiKey ? '[exists]' : '[missing]'
  })
  
  if (!config.database?.host) throw new Error('MYSQL_HOST is required')
  if (!config.database?.user) throw new Error('MYSQL_USER is required')
  if (!config.database?.password) throw new Error('MYSQL_PASSWORD is required')
  if (!config.database?.database) throw new Error('MYSQL_DATABASE is required')
  if (!config.chatbase.apiKey) throw new Error('CHATBASE_API_KEY is required')
} 