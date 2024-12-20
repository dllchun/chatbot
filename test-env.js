require('dotenv').config()

console.log('Environment Variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '[exists]' : '[missing]')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[exists]' : '[missing]')
console.log('CHATBASE_API_KEY:', process.env.CHATBASE_API_KEY ? '[exists]' : '[missing]') 