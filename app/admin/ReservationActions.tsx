'use client';

import { useState } from 'react';

type Reservation = {
  id: string;
  code: string;
  status: string;
};

export default function ReservationActions({ reservation }: { reservation: Reservation }) {
  const [status, setStatus] = useState(reservation.status);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (nextStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'Failed to update reservation.');
      }

      setStatus(body.reservation.status);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to update reservation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(event) => updateStatus(event.target.value)}
      style={{
        background: '#171913',
        color: '#eee',
        border: '1px solid #30342b',
        borderRadius: 10,
        padding: '8px 10px',
      }}
      aria-label={`Update status for ${reservation.code}`}
    >
      <option value="PENDING">Pending</option>
      <option value="CONFIRMED">Confirmed</option>
      <option value="CANCELLED">Cancelled</option>
      <option value="COMPLETED">Completed</option>
    </select>
  );
}
