import { PrismaClient, Role, SeatStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const seats = [
  { code: 'A01', label: 'A01', capacity: 2, zone: 'Window', posX: 12, posY: 18, shape: 'round' },
  { code: 'A02', label: 'A02', capacity: 2, zone: 'Window', posX: 28, posY: 18, shape: 'round' },
  { code: 'A03', label: 'A03', capacity: 2, zone: 'Window', posX: 44, posY: 18, shape: 'round' },
  { code: 'B01', label: 'B01', capacity: 4, zone: 'Center', posX: 22, posY: 45, shape: 'square' },
  { code: 'B02', label: 'B02', capacity: 4, zone: 'Center', posX: 42, posY: 45, shape: 'square' },
  { code: 'B03', label: 'B03', capacity: 4, zone: 'Center', posX: 62, posY: 45, shape: 'square' },
  { code: 'C01', label: 'C01', capacity: 2, zone: 'Lounge', posX: 18, posY: 72, shape: 'round' },
  { code: 'C02', label: 'C02', capacity: 2, zone: 'Lounge', posX: 36, posY: 72, shape: 'round' },
  { code: 'D01', label: 'D01', capacity: 6, zone: 'Group', posX: 58, posY: 72, shape: 'rectangle' },
  { code: 'D02', label: 'D02', capacity: 6, zone: 'Group', posX: 78, posY: 72, shape: 'rectangle' },
];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@auracafe.local';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error('ADMIN_PASSWORD is not set in .env');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Aura Cafe Admin',
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      name: 'Aura Cafe Admin',
      email,
      passwordHash,
      role: Role.ADMIN,
    },
  });

  for (const seat of seats) {
    await prisma.seat.upsert({
      where: { code: seat.code },
      update: {
        ...seat,
        status: SeatStatus.AVAILABLE,
      },
      create: {
        ...seat,
        status: SeatStatus.AVAILABLE,
      },
    });
  }

  console.log('Seed completed successfully.');
  console.log(`Admin: ${email}`);
  console.log(`Seats seeded: ${seats.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
