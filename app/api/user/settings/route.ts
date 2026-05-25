import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const { uid: firebaseUid } = await verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { dailyLimit } = body;

    // Get current settings
    const currentSettings = (user.settings as any) || {};
    
    // Update settings with new dailyLimit
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        settings: {
          ...currentSettings,
          dailyLimit: dailyLimit !== undefined ? parseFloat(dailyLimit) : currentSettings.dailyLimit
        }
      }
    });

    return NextResponse.json(updatedUser.settings);
  } catch (error: any) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
