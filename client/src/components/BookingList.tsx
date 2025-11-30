// client/src/components/BookingList.tsx
import type { Booking } from "../types";

interface BookingListProps {
  bookings: Booking[];
  onCancel: (bookingId: number) => void;
}
const formatDate = (iso: string) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const getHotelName = (booking: Booking) => {
  return booking.room?.hotel?.name ?? "알 수 없음";
};

const getRoomNumber = (booking: Booking) => {
  return booking.room?.roomNumber ?? booking.roomId;
};

export default function BookingList({ bookings, onCancel }: BookingListProps) {
  if (bookings.length === 0) {
    return <p className="empty-bookings">아직 예약한 내역이 없습니다.</p>;
  }

  return (
    <>
      {bookings.map((booking) => {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);

        const nights =
          (checkOutDate.getTime() - checkInDate.getTime()) /
          (1000 * 60 * 60 * 24);

        const isCancelled = booking.status === "cancelled";
        const nightlyPrice = booking.room?.price ?? 0;
        const totalPrice = nightlyPrice * nights;

        return (
          <section
            key={booking.id}
            className={
              "booking-card" + (isCancelled ? " booking-card--cancelled" : "")
            }
          >
            <p className="booking-hotel-name">
              호텔: {getHotelName(booking) ?? "알 수 없음"}
            </p>
            <p>방 번호: {getRoomNumber(booking)}</p>

            <p className="booking-dates">
              기간: {formatDate(booking.checkIn)} ~{" "}
              {formatDate(booking.checkOut)} ({nights}박)
            </p>

            <p>1박 요금: {nightlyPrice.toLocaleString()}원</p>
            <p>총 요금: {totalPrice.toLocaleString()}원</p>

            <div className="booking-footer">
              <span
                className={
                  "booking-status " +
                  (isCancelled
                    ? "booking-status--cancelled"
                    : "booking-status--confirmed")
                }
              >
                {booking.status}
              </span>

              {!isCancelled && (
                <button
                  className="cancel-button"
                  onClick={() => onCancel(booking.id)}
                >
                  예약 취소
                </button>
              )}
            </div>

            {isCancelled && (
              <p className="booking-cancel-note">이미 취소된 예약입니다.</p>
            )}
          </section>
        );
      })}
    </>
  );
}
