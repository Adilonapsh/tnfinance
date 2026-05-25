import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const { uid, email: tokenEmail } = await verifyToken(token);

    const body = await req.json();
    const { displayName, photoUrl, emailVerified } = body;

    // Upsert user into PostgreSQL
    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        lastLoginAt: new Date(),
        emailVerified: emailVerified ?? false,
        displayName: displayName || undefined,
        photoUrl: photoUrl || undefined,
      },
      create: {
        firebaseUid: uid,
        email: tokenEmail ?? '',
        emailVerified: emailVerified ?? false,
        displayName: displayName || 'User',
        photoUrl: photoUrl || null,
        currency: 'IDR',
        locale: 'id-ID',
        timezone: 'Asia/Jakarta',
        onboardingCompleted: true,
        lastLoginAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    console.error('Error in /api/user/sync:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
