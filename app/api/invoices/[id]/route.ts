import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: any }
) {
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

    // Await params to get the ID
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { 
      invoiceNumber, client, email, project, date, dueDate, status, tax, discount, notes, items 
    } = body;

    // Check if invoice belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Update invoice and replace items
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        invoiceNumber,
        client,
        email,
        project,
        date: new Date(date),
        dueDate: new Date(dueDate),
        status,
        tax: parseFloat(tax) || 0,
        discount: parseFloat(discount) || 0,
        notes,
        items: {
          deleteMany: {}, // Wipe existing items
          create: items.map((item: any) => ({
            description: item.description,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error: any) {
    console.error('Error in PATCH /api/invoices/[id]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: any }
) {
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

    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Check if invoice belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.invoice.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/invoices/[id]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
