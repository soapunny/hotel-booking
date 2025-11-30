// ============================================
// App.tsx
// 호텔 목록을 백엔드 API에서 불러와서
// 화면에 카드 형태로 보여주는 메인 React 컴포넌트
// ============================================

// ✅ React에서 제공하는 훅(Hook)들
// useState  : 상태(state)를 저장하기 위한 함수
// useEffect: 컴포넌트가 처음 실행될 때 특정 작업(API 호출 등)을 실행하기 위한 함수
import { useEffect, useState } from "react";

// ✅ 우리가 만든 axios 인스턴스 (백엔드 API와 통신용)
import { api } from "./lib/api";

// ============================================
// 타입(Type) 정의 영역
// TypeScript에서 "백엔드에서 받아오는 데이터 구조"를
// 미리 정의해 두면 자동완성과 타입 체크가 되어 매우 안전함
// ============================================

// ✅ 방(Room) 하나의 데이터 구조
type Room = {
  id: number; // 방 고유 ID (DB 기본키)
  hotelId: number; // 이 방이 속한 호텔의 ID
  roomNumber: string; // 방 번호 ("101", "102" 등)
  type: string; // 방 타입 ("single", "double")
  price: number; // 1박 가격
};

// ✅ 호텔(Hotel) 하나의 데이터 구조
type Hotel = {
  id: number; // 호텔 ID
  name: string; // 호텔 이름
  city: string; // 도시
  address: string; // 주소
  createdAt: string; // 생성일 (DB에서 문자열로 내려옴)
  rooms: Room[]; // 이 호텔이 가진 방들의 배열
};

// ============================================
// 실제 화면을 담당하는 React 컴포넌트
// ============================================
function App() {
  // ✅ 호텔 목록 상태 (처음에는 빈 배열)
  // hotels 안에는 Hotel 타입 객체들이 배열로 저장됨
  const [hotels, setHotels] = useState<Hotel[]>([]);

  //예약 상태
  const [bookings, setBookings] = useState<any[]>([]);

  // ✅ 로딩 상태 (API 호출 중인지 표시)
  // true  = 로딩 중
  // false = 로딩 완료
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ 에러 메시지 상태
  // null  = 에러 없음
  // string = 에러 메시지 있음
  const [error, setError] = useState<string | null>(null);

  // ✅ 예약에 사용할 체크인 / 체크아웃 날짜 (YYYY-MM-DD 문자열)
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");

  // ============================================
  // 컴포넌트가 처음 화면에 나타날 때 한 번만 실행되는 영역
  // 여기서 백엔드 API (/hotels) 를 호출한다.
  // ============================================
  useEffect(() => {
    // ✅ async 함수로 API 요청 처리
    const fetchHotels = async () => {
      try {
        // API 요청 시작 → 로딩 true
        setLoading(true);

        // 이전 에러 메시지 초기화
        setError(null);

        // ✅ GET /hotels 호출
        // 실제 요청 주소:
        // http://localhost:3000/hotels
        const res = await api.get<Hotel[]>("/hotels");

        // ✅ 서버에서 받아온 호텔 배열 데이터를
        // React 상태에 저장
        setHotels(res.data);
      } catch (err) {
        // ❌ API 요청 중 에러가 발생했을 때 실행됨
        console.error(err);
        setError("호텔 목록을 불러오는 데 실패했습니다.");
      } finally {
        // ✅ 성공하든 실패하든 로딩은 종료
        setLoading(false);
      }
    };

    // ✅ 위에서 정의한 함수 실행
    fetchHotels();

    // [] ← 이 배열이 비어 있으면
    // 이 useEffect는 "컴포넌트가 처음 나타날 때 딱 1번만 실행"
  }, []);

  // ============================================
  // 방 예약 버튼을 눌렀을 때 실행되는 함수
  // ============================================
  const handleBookRoom = async (room: Room) => {
    try {
      // 1) 날짜가 입력되었는지 확인
      if (!checkIn || !checkOut) {
        alert("체크인 / 체크아웃 날짜를 먼저 선택해주세요.");
        return;
      }

      // 2) 날짜 순서 검증 (체크인은 체크아웃보다 앞이어야 함)
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        alert("유효하지 않은 날짜 형식입니다.");
        return;
      }

      if (checkInDate >= checkOutDate) {
        alert("체크인은 체크아웃보다 앞날이어야 합니다.");
        return;
      }

      // 3) 백엔드로 보낼 payload
      // input type="date" 값(YYYY-MM-DD)은
      // 서버에서 new Date("YYYY-MM-DD") 로 처리 가능
      const payload = {
        roomId: room.id,
        checkIn, // 문자열 그대로 보내도 됨
        checkOut, // 백엔드에서 Date로 변환
      };

      // 4) 예약 API 호출
      const res = await api.post("/bookings", payload);

      // 5) 성공 안내
      alert(
        `예약 완료!\n\n방 번호: ${room.roomNumber}\n타입: ${room.type}\n기간: ${checkIn} ~ ${checkOut}`
      );
      console.log("Booking created:", res.data);
    } catch (err) {
      console.error(err);
      alert("예약에 실패했습니다. 콘솔을 확인해주세요.");
    }
  };

  // ============================
  // 예약 목록 불러오는 함수
  // ============================
  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data);
      console.log("내 예약 목록:", res.data);
    } catch (err) {
      console.error(err);
      alert("예약 목록을 불러오는데 실패했습니다.");
    }
  };

  // ============================================
  // 화면에 실제로 출력되는 JSX 영역
  // ============================================
  return (
    <div
      style={{
        maxWidth: 960, // 최대 폭
        margin: "0 auto", // 화면 가운데 정렬
        padding: "24px", // 내부 여백
      }}
    >
      {/* ✅ 페이지 제목 */}
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "16px",
        }}
      >
        호텔 예약 데모
      </h1>

      <button
        onClick={fetchBookings}
        style={{
          marginLeft: 12,
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "#222",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        내 예약 보기
      </button>

      {/* ✅ 날짜 선택 영역 */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <label>
          체크인:{" "}
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </label>

        <label>
          체크아웃:{" "}
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>

        <span style={{ fontSize: 12, opacity: 0.7 }}>
          * 날짜 선택 후 아래 방에서 예약하기 버튼을 눌러주세요
        </span>
      </div>

      {/* ✅ 로딩 중일 때 표시 */}
      {loading && <p>불러오는 중...</p>}

      {/* ✅ 에러가 있을 때 표시 */}
      {error && <p style={{ color: "red", marginBottom: "16px" }}>{error}</p>}

      {/* ✅ 호텔 데이터가 하나도 없을 때 */}
      {!loading && !error && hotels.length === 0 && (
        <p>
          등록된 호텔이 없습니다. (백엔드에서 /seed 로 테스트 데이터를 먼저
          넣어주세요)
        </p>
      )}

      {/* ============================================
          ✅ 호텔 목록 렌더링 영역
         ============================================ */}
      <div style={{ display: "grid", gap: "16px" }}>
        {hotels.map((hotel) => (
          <div
            key={hotel.id} // React가 리스트를 구분하기 위한 고유 key
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 16,
              background: "#111",
              color: "#fff",
            }}
          >
            {/* ✅ 호텔 이름 */}
            <h2 style={{ fontSize: "20px", marginBottom: 8 }}>{hotel.name}</h2>

            {/* ✅ 호텔 도시 + 주소 */}
            <p style={{ margin: 0, opacity: 0.8 }}>
              {hotel.city} · {hotel.address}
            </p>

            {/* ✅ 방 목록 제목 */}
            <h3
              style={{
                marginTop: 12,
                marginBottom: 4,
                fontSize: "16px",
              }}
            >
              방 목록
            </h3>

            {/* ✅ 방이 하나도 없을 때 */}
            {hotel.rooms.length === 0 ? (
              <p style={{ opacity: 0.8 }}>등록된 방이 없습니다.</p>
            ) : (
              // ✅ 방이 있을 때 목록 출력
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {hotel.rooms.map((room) => (
                  <li
                    key={room.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    {/* 왼쪽: 방 정보 */}
                    <span>
                      {room.roomNumber}호 · {room.type} ·{" "}
                      {room.price.toLocaleString()}원 / 박
                    </span>

                    {/* 오른쪽: 예약 버튼 */}
                    <button
                      onClick={() => handleBookRoom(room)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 4,
                        border: "none",
                        backgroundColor: "#4caf50",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      예약하기
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {bookings.length > 0 && (
        <div
          style={{
            marginTop: 32,
            padding: 16,
            border: "1px solid #444",
            borderRadius: 8,
            maxWidth: 600,
          }}
        >
          <h2 style={{ marginBottom: 12 }}>내 예약 목록</h2>

          {bookings.map((b) => (
            <div
              key={b.id}
              style={{
                padding: 10,
                borderBottom: "1px solid #333",
                marginBottom: 8,
              }}
            >
              <div>호텔: {b.room.hotel.name}</div>
              <div>방 번호: {b.room.roomNumber}</div>
              <div>
                기간: {b.checkIn.slice(0, 10)} ~ {b.checkOut.slice(0, 10)}
              </div>
              <div>상태: {b.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ 다른 파일에서 App을 사용할 수 있도록 export
export default App;
