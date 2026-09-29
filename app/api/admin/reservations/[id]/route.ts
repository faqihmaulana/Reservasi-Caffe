import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { status } = schema.parse(await req.json());

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status },
      include: { user: true, seat: true },
    });

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Admin reservation action error:', error);
    return NextResponse.json(
      { error: 'Failed to update reservation.' },
      { status: 400 },
    );
  }
}
