import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    // Calculate derived values if numbers are provided
    const updateData: any = {
      name,
      tickerSymbol,
      type,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      icon,
      accountId,
    };

    if (currentPrice !== undefined) updateData.currentPrice = parseFloat(currentPrice);
    if (purchasePrice !== undefined) updateData.purchasePrice = parseFloat(purchasePrice);
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);

    // Fetch existing data to recalculate totals if needed
    const existing = await prisma.investment.findUnique({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: 'Investment not found' }, { status: 404 });

    const finalCurrentPrice = updateData.currentPrice ?? existing.currentPrice;
    const finalPurchasePrice = updateData.purchasePrice ?? existing.purchasePrice;
    const finalQuantity = updateData.quantity ?? existing.quantity;

    updateData.totalValue = finalCurrentPrice * finalQuantity;
    updateData.costBasis = finalPurchasePrice * finalQuantity;
    updateData.unrealizedGainLoss = updateData.totalValue - updateData.costBasis;
    updateData.unrealizedGainLossPercentage = updateData.costBasis !== 0 ? (updateData.unrealizedGainLoss / updateData.costBasis) * 100 : 0;

    const investment = await prisma.investment.update({
      where: { id, userId: user.id },
      data: updateData,
    });

    return NextResponse.json(investment);
  } catch (error: any) {
    console.error('Error updating investment:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    await prisma.investment.update({
      where: { id, userId: user.id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting investment:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
