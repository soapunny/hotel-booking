// client/src/components/BookingList.tsx
import React from "react";
import type { Booking } from "../types";

interface BookingListProps {
  bookings: Booking[];
  onCancel: (bookingId: number) => void;
}

export function BookingList({ bookings, onCancel }: BookingListProps) {
  if (bookings.length === 0) {
    return <p>아직 예약한 내역이 없습니다.</p>;
  }

  return (
    <>
      {bookings.map((booking) => {
        const nights =
          (new Date(booking.checkOut).getTime() -
            new Date(booking.checkIn).getTime()) /
          (1000 * 60 * 60 * 24);

        const isCancelled = booking.status === "cancelled";

        return (
          <section
            key={booking.id}
            style={{
              backgroundColor: isCancelled ? "#020617" : "#111827",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              opacity: isCancelled ? 0.5 : 1,
            }}
          >
            <p style={{ fontSize: 14, color: "#9ca3af" }}>
              호텔: {booking.hotel?.name ?? "Test Hotel"}
            </p>
            <p>방 번호: {booking.room?.roomNumber ?? booking.roomId}</p>
            <p>
              기간: {booking.checkIn.slice(0, 10)} ~{" "}
              {booking.checkOut.slice(0, 10)} ({nights}박)
            </p>
            <p>상태: {booking.status}</p>

            {!isCancelled && (
              <button
                onClick={() => onCancel(booking.id)}
                style={{
                  marginTop: 8,
                  padding: "6px 12px",
                  backgroundColor: "#ef4444",
                  borderRadius: 6,
                  border: "none",
                  color: "#fff",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                예약 취소
              </button>
            )}

            {isCancelled && (
              <p style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                이미 취소된 예약입니다.
              </p>
            )}
          </section>
        );
      })}
    </>
  );
}
