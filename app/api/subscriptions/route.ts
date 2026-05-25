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

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: user.id,
        isDeleted: false,
      },
      include: {
        category: true
      },
      orderBy: {
        nextBillingDate: 'asc'
      }
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error in /api/subscriptions:', error);
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
    const { name, provider, amount, billingDate, billingPeriod, categoryId, icon, nextBillingDate } = body;

    if (!name || !amount || !billingPeriod || !nextBillingDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        name,
        provider,
        amount: parseFloat(amount),
        billingDate: parseInt(billingDate) || 1,
        billingPeriod,
        categoryId,
        icon: icon || 'credit-card',
        nextBillingDate: new Date(nextBillingDate),
      },
    });

    return NextResponse.json(subscription);
  } catch (error: any) {
    console.error('Error in POST /api/subscriptions:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
