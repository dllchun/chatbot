import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // This endpoint is just to help clear client-side cache
    // The actual clearing happens on the frontend
    return NextResponse.json({
      success: true,
      message: 'Settings cleared successfully',
      instructions: 'Frontend should clear localStorage and Zustand persistence'
    });

  } catch (error) {
    console.error('Clear settings error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}