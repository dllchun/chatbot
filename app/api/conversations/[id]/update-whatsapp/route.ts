import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { supabase } from '@/lib/api/supabase';

// Define and validate the WhatsApp number format
const UpdateSchema = z.object({
  whatsappNumber: z.string().regex(/^\d{8}$/, 'WhatsApp number must be 8 digits'),
});

type ApiRouteContext = {
  params:Promise<{
    id: string;
  }>;
};

export async function POST(
  req: NextRequest,
  context: ApiRouteContext
) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await context.params;

    // Parse and validate the request body
    const body = await req.json();
    const { whatsappNumber } = UpdateSchema.parse(body);

    // Update the record in the database
    const { error } = await supabase
      .from('conversations')
      .update({ whatsapp_number: whatsappNumber })
      .eq('id', id)
      .eq('user_id', userId);

    // Handle potential database errors
    if (error) {
      console.error('Error updating WhatsApp number:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Return a success response
    return new NextResponse('OK');
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(error.errors, { status: 400 });
    }

    // Log and return other errors
    console.error('Error in POST /api/conversations/[id]/update-whatsapp:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}