// client/src/App.tsx
import { useEffect, useState } from "react";
import "./App.css";
import type { Hotel, Room, Booking } from "./types";
import {
  fetchHotels,
  fetchMyBookings,
  createBooking,
  cancelBooking,
} from "./lib/api";
import { HotelList } from "./components/HotelList";
import { BookingList } from "./components/BookingList";
import Toast from "./components/Toast";

function App() {
  // ============================
  // 상태 관리
  // ============================
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [isHotelsLoading, setHotelsLoading] = useState(false);
  const [hotelError, setHotelError] = useState<string | null>(null);

  const [isBookingProcessing, setBookingProcessing] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [showBookings, setShowBookings] = useState(false);

  // 체크인 / 체크아웃 날짜 (문자열)
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");

  // ============================
  // 초기 데이터 로딩
  // ============================
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setHotelsLoading(true);
        setHotelError(null);

        const [hotelList, bookingList] = await Promise.all([
          fetchHotels(),
          fetchMyBookings(),
        ]);

        setHotels(hotelList);
        setBookings(bookingList);
      } catch (err) {
        console.error("초기 데이터 로딩 실패:", err);
        setHotelError("호텔 목록을 불러오는 데 실패했습니다.");
      } finally {
        setHotelsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // ============================
  // 토스트 헬퍼
  // ============================
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // ============================
  // 예약 버튼 클릭 핸들러
  // ============================
  const handleBookRoom = async (room: Room) => {
    if (!checkIn || !checkOut) {
      showToast("체크인 / 체크아웃 날짜를 먼저 선택해주세요.", "error");
      return;
    }

    try {
      setBookingProcessing(true);

      const newBooking = await createBooking({
        roomId: room.id,
        checkIn,
        checkOut,
      });

      setBookings((prev) => [newBooking, ...prev]);
      showToast("예약이 완료되었습니다!", "success");
    } catch (err) {
      console.error("예약 실패:", err);
      showToast("예약 중 오류가 발생했습니다.", "error");
    } finally {
      setBookingProcessing(false);
    }
  };

  // ============================
  // 예약 취소 버튼 핸들러
  // ============================
  const handleCancelBooking = async (bookingId: number) => {
    const confirmCancel = window.confirm("정말 이 예약을 취소하시겠습니까?");
    if (!confirmCancel) return;

    try {
      setBookingProcessing(true);
      const updated = await cancelBooking(bookingId);

      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      showToast("예약이 취소되었습니다.", "success");
    } catch (err) {
      console.error("예약 취소 실패:", err);
      showToast("예약 취소 중 오류가 발생했습니다.", "error");
    } finally {
      setBookingProcessing(false);
    }
  };

  // ============================
  // 렌더링
  // ============================
  return (
    <div className="app-root">
      <main className="app-container">
        <header className="app-header">
          <h1>호텔 예약 데모</h1>
          <button
            className="my-bookings-button"
            onClick={() => {
              // 1) 먼저 보이도록 상태 변경
              setShowBookings(true);

              // 2) 약간 딜레이 후 스크롤 (상태 업데이트 반영 시간 때문에)
              setTimeout(() => {
                const el = document.getElementById("my-bookings");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }}
          >
            내 예약 보기
          </button>
        </header>

        {/* 날짜 선택 UI */}
        <section className="date-section">
          <label>
            체크인:
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </label>
          <label>
            체크아웃:
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </label>
          {isBookingProcessing && (
            <span className="booking-spinner">처리 중...</span>
          )}
        </section>

        {/* 호텔 리스트 */}
        <HotelList
          hotels={hotels}
          onBook={handleBookRoom}
          isLoading={isHotelsLoading}
          error={hotelError}
        />

        {/* 내 예약 목록 */}
        {showBookings && (
          <section id="my-bookings" style={{ marginTop: 32 }}>
            <h2>내 예약 목록</h2>
            <BookingList bookings={bookings} onCancel={handleCancelBooking} />
          </section>
        )}
      </main>

      {/* 토스트 */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}

export default App;
