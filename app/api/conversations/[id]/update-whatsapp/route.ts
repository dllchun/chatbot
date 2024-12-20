import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { supabase } from '@/lib/api/supabase'

const UpdateSchema = z.object({
  whatsappNumber: z.string().regex(/^\d{8}$/, 'WhatsApp number must be 8 digits'),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { whatsappNumber } = UpdateSchema.parse(body)

    const { error } = await supabase
      .from('conversations')
      .update({ whatsapp_number: whatsappNumber })
      .eq('id', params.id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating WhatsApp number:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    return new NextResponse('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(error.errors, { status: 400 })
    }
    console.error('Error in POST /api/conversations/[id]/update-whatsapp:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 