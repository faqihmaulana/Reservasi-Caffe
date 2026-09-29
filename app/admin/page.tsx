import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  const [reservations, seats] = await Promise.all([
    prisma.reservation.findMany({
      include: { seat: true, user: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.seat.findMany({
      orderBy: { code: 'asc' },
    }),
  ]);

  const confirmed = reservations.filter((r) => r.status === 'CONFIRMED').length;

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 40,
        maxWidth: 1200,
        margin: 'auto',
      }}
    >
      <p className="eyebrow">
        <span /> Admin dashboard
      </p>

      <h1
        style={{
          font: '600 58px/1 Playfair Display',
          margin: '15px 0 45px',
        }}
      >
        Reservation <em>control.</em>
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 16,
        }}
      >
        {[
          ['Reservations', reservations.length],
          ['Confirmed', confirmed],
          ['Seats', seats.length],
        ].map((item) => (
          <div
            key={item[0]}
            style={{
              padding: 25,
              border: '1px solid #2a2d26',
              borderRadius: 18,
              background: '#11120f',
            }}
          >
            <small style={{ color: '#777' }}>{item[0]}</small>
            <h2 style={{ fontSize: 36 }}>{item[1]}</h2>
          </div>
        ))}
      </div>

      <section
        style={{
          marginTop: 30,
          border: '1px solid #2a2d26',
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: 22,
            borderBottom: '1px solid #2a2d26',
          }}
        >
          <b>Latest reservations</b>
        </div>

        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 120px',
              padding: 18,
              borderBottom: '1px solid #ffffff0b',
            }}
          >
            <span>{reservation.code}</span>
            <span>{reservation.user.name}</span>
            <span>
              {reservation.seat.code} · {reservation.startTime}
            </span>
            <span>{reservation.status}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
