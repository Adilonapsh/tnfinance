import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ error: 'User not found in Postgres' }, { status: 404 });
    }

    const savingPlans = await prisma.savingPlan.findMany({
      where: {
        userId: user.id,
        isDeleted: false,
      },
      include: {
        linkedAccount: true
      },
      orderBy: {
        priority: 'desc'
      }
    });

    return NextResponse.json(savingPlans);
  } catch (error) {
    console.error('Error in /api/saving-plans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: 'User not found in Postgres' }, { status: 404 });
    }

    const body = await req.json();
    const { name, targetAmount, currentAmount, deadline, icon, color, linkedAccountId } = body;

    if (!name || !targetAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const savingPlan = await prisma.savingPlan.create({
      data: {
        userId: user.id,
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        deadline: deadline ? new Date(deadline) : null,
        icon: icon || 'Target',
        color: color || 'emerald',
        linkedAccountId: linkedAccountId === "" ? null : (linkedAccountId || null),
        priority: 0,
      },
    });

    return NextResponse.json(savingPlan);
  } catch (error: any) {
    console.error('Error in POST /api/saving-plans:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
