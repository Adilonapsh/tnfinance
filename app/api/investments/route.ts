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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const investments = await prisma.investment.findMany({
      where: { userId: user.id, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(investments);
  } catch (error: any) {
    console.error('Error fetching investments:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, tickerSymbol, type, currentPrice, purchasePrice, quantity, purchaseDate, icon, accountId } = body;

    const totalValue = parseFloat(currentPrice) * parseFloat(quantity);
    const costBasis = parseFloat(purchasePrice) * parseFloat(quantity);
    const unrealizedGainLoss = totalValue - costBasis;
    const unrealizedGainLossPercentage = costBasis !== 0 ? (unrealizedGainLoss / costBasis) * 100 : 0;

    const investment = await prisma.investment.create({
      data: {
        userId: user.id,
        name,
        tickerSymbol,
        type,
        currentPrice: parseFloat(currentPrice),
        purchasePrice: parseFloat(purchasePrice),
        quantity: parseFloat(quantity),
        totalValue,
        costBasis,
        unrealizedGainLoss,
        unrealizedGainLossPercentage,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        icon: icon || 'trending-up',
        accountId,
      },
    });

    return NextResponse.json(investment);
  } catch (error: any) {
    console.error('Error creating investment:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
