import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeMutation } from '@/lib/database/queries';

export const runtime = 'nodejs';

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

    console.log('Updating WhatsApp number:', {
      conversationId: id,
      whatsappNumber,
      userId
    });

    // Update the record in MySQL
    const result = await executeMutation(
      'UPDATE conversations SET whatsapp_number = ?, updated_at = NOW() WHERE id = ?',
      [whatsappNumber, id]
    );

    // Handle potential database errors
    if (result.error) {
      console.error('Error updating WhatsApp number:', result.error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    if (result.data && result.data.affectedRows === 0) {
      return new NextResponse('Conversation not found', { status: 404 });
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