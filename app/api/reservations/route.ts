import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  seatCode: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  guests: z.number().int().positive(),
  notes: z.string().optional(),
});

function addHours(time: string, hours: number) {
  const [hour, minute] = time.split(':').map(Number);
  const total = hour * 60 + minute + hours * 60;
  const nextHour = Math.floor(total / 60) % 24;
  const nextMinute = total % 60;
  return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
}

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const date = new Date(`${data.date}T00:00:00`);
    const endTime = addHours(data.startTime, 2);

    const seat = await prisma.seat.findUnique({
      where: { code: data.seatCode },
    });

    if (!seat || seat.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Seat is not available.' }, { status: 400 });
    }

    if (data.guests > seat.capacity) {
      return NextResponse.json(
        { error: `Seat capacity is limited to ${seat.capacity} guests.` },
        { status: 400 },
      );
    }

    const conflict = await prisma.reservation.findFirst({
      where: {
        seatId: seat.id,
        date,
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: data.startTime } },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: 'Seat is already reserved for this time.' },
        { status: 409 },
      );
    }

    // Customer accounts are not logged in yet, so create a random
    // password hash for first-time customers. The customer never receives
    // or uses this password in the public booking flow.
    const guestPasswordHash = await bcrypt.hash(
      `guest-${crypto.randomUUID()}`,
      10,
    );

    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        phone: data.phone,
      },
      create: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: guestPasswordHash,
        role: 'CUSTOMER',
      },
    });

    const code = `AURA-${Date.now().toString(36).toUpperCase()}`;

    const reservation = await prisma.reservation.create({
      data: {
        code,
        userId: user.id,
        seatId: seat.id,
        date,
        startTime: data.startTime,
        endTime,
        guests: data.guests,
        fee: 25000,
        notes: data.notes,
      },
      include: {
        user: true,
        seat: true,
      },
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error('Reservation error:', error);

    return NextResponse.json(
      { error: 'Invalid reservation data.' },
      { status: 400 },
    );
  }
}
