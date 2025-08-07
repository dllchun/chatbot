import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { executeMutation, executeQuery } from '@/lib/database/queries';
import { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';

interface UserRow extends RowDataPacket {
  id: string;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Syncing user with MySQL:', userId);

    // Get user data from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in Clerk' },
        { status: 404 }
      );
    }

    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    );
    const now = new Date().toISOString().slice(0, 19).replace('T', ' '); // MySQL datetime format

    // Check if user exists
    const existingUser = await executeQuery<UserRow[]>(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUser.error) {
      console.error('Error checking existing user:', existingUser.error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!existingUser.data || existingUser.data.length === 0) {
      // Insert new user
      const userData = {
        id: userId,
        email: primaryEmail?.emailAddress || '',
        first_name: user.firstName || null,
        last_name: user.lastName || null,
        image_url: user.imageUrl || null,
        created_at: new Date(user.createdAt).toISOString().slice(0, 19).replace('T', ' '),
        updated_at: now,
        last_sign_in_at: now
      };

      const insertResult = await executeMutation(
        `INSERT INTO users (id, email, first_name, last_name, image_url, created_at, updated_at, last_sign_in_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         email = VALUES(email),
         first_name = VALUES(first_name),
         last_name = VALUES(last_name),
         image_url = VALUES(image_url),
         updated_at = VALUES(updated_at),
         last_sign_in_at = VALUES(last_sign_in_at)`,
        [
          userData.id,
          userData.email,
          userData.first_name,
          userData.last_name,
          userData.image_url,
          userData.created_at,
          userData.updated_at,
          userData.last_sign_in_at
        ]
      );

      if (insertResult.error) {
        console.error('MySQL upsert error:', insertResult.error);
        return NextResponse.json(
          { error: 'Failed to sync user' },
          { status: 500 }
        );
      }

      console.log('User synced successfully (new user)');
      return NextResponse.json({
        success: true,
        message: 'User synced successfully (new user)',
        user: userData
      });
    } else {
      // Update existing user's last sign in
      const updateResult = await executeMutation(
        'UPDATE users SET last_sign_in_at = ?, updated_at = ? WHERE id = ?',
        [now, now, userId]
      );

      if (updateResult.error) {
        console.error('Error updating user:', updateResult.error);
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }

      console.log('User synced successfully (existing user)');
      return NextResponse.json({
        success: true,
        message: 'User synced successfully (existing user)'
      });
    }

  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}