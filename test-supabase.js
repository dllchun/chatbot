require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase Configuration:', {
  url: url ? '[exists]' : '[missing]',
  key: key ? '[exists]' : '[missing]'
})

if (!url || !key) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(url, key)

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Success! Data:', data)
    }
  } catch (error) {
    console.error('Caught error:', error)
  }
}

testConnection() 