// ===============================
// server/src/index.js
// 호텔 + 방 + 예약 API 서버 (Express + Prisma)
// ===============================

// Express: Node.js용 웹 서버 프레임워크
const express = require("express");

// CORS: 다른 도메인(예: React 프론트, 5173 포트)에서 접근을 허용해 주는 미들웨어
const cors = require("cors");

// PrismaClient: 우리가 정의한 schema.prisma 기반으로 DB 접근을 도와주는 ORM
const { PrismaClient } = require("@prisma/client");

// Express 앱 생성
const app = express();

// Prisma 클라이언트 인스턴스 생성
const prisma = new PrismaClient();

// ===============================
// 미들웨어 설정
// ===============================

// CORS 허용 (개발 중에는 기본값으로 두면 모든 도메인에서 접근 가능)
app.use(cors());

// JSON 바디 파싱 (POST/PUT 요청 body를 JS 객체로 변환)
app.use(express.json());

// ===============================
// 공통 유틸: 기본 유저 보장 함수
// ===============================
//
// 지금은 로그인/회원가입 기능이 없어서,
// 항상 같은 테스트 유저 1명을 사용하게 만들자.
//    - 이메일: guest@example.com
// 이 유저가 없으면 새로 만들고, 있으면 그대로 사용한다.
//
async function getOrCreateDefaultUser() {
  const email = "guest@example.com";

  // 1) 해당 이메일의 유저가 이미 있는지 확인
  let user = await prisma.user.findUnique({
    where: { email },
  });

  // 2) 없으면 새로 생성
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Guest User",
        password: "dummy-password", // 실제 서비스라면 비밀번호 해시가 들어가야 하는 자리
      },
    });
  }

  return user;
}

// ===============================
// 1. 헬스 체크 라우트
// ===============================
//
// 브라우저에서 http://localhost:3000/ 으로 접속하면
// "API is running" 이라는 문구가 보이면 서버가 잘 동작하는 것.
//
app.get("/", (req, res) => {
  res.send("API is running");
});

// ===============================
// 2. 테스트용 시드(seed) 라우트
// ===============================
//
// POST /seed 를 호출하면 테스트용 호텔 + 방 데이터를 DB에 추가한다.
// 실제 서비스에서는 개발 초기 테스트용으로만 사용하고 나중에는 제거할 수 있다.
//
app.post("/seed", async (req, res) => {
  try {
    const hotel = await prisma.hotel.create({
      data: {
        name: "Test Hotel",
        city: "Seoul",
        address: "123 Test Street",
        rooms: {
          create: [
            {
              roomNumber: "101",
              type: "single",
              price: 100000,
            },
            {
              roomNumber: "102",
              type: "double",
              price: 150000,
            },
          ],
        },
      },
      include: { rooms: true }, // 생성된 호텔 + 그 호텔에 속한 방까지 함께 반환
    });

    res.json(hotel);
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: "Seeding failed" });
  }
});

// ===============================
// 3. 호텔 리스트 조회 라우트
// ===============================
//
// GET /hotels
// -> 모든 호텔 + 각 호텔에 속한 rooms 배열을 JSON으로 반환한다.
//
app.get("/hotels", async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        rooms: true, // 각 호텔에 연결된 방들까지 같이 가져오기
      },
    });
    res.json(hotels);
  } catch (err) {
    console.error("Get hotels error:", err);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

// ===============================
// 4. 예약 생성 라우트
// ===============================
//
// POST /bookings
// Body 예시:
// {
//   "roomId": 1,
//   "checkIn": "2025-12-01",
//   "checkOut": "2025-12-03"
// }
//
// - 현재는 로그인 기능이 없으므로, getOrCreateDefaultUser() 를 통해
//   guest 유저를 자동으로 만들어서 그 유저 명의로 예약을 생성한다.
//
app.post("/bookings", async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    // 1) 필수값 검증 (아주 기본적인 체크)
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        error: "roomId, checkIn, checkOut 값은 모두 필수입니다.",
      });
    }

    // 2) 문자열로 온 날짜를 Date 객체로 변환
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // 3) 날짜 유효성 간단 체크 (checkIn < checkOut)
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: "유효하지 않은 날짜 형식입니다." });
    }
    if (checkInDate >= checkOutDate) {
      return res
        .status(400)
        .json({ error: "체크인 날짜는 체크아웃보다 앞서야 합니다." });
    }

    // 4) 기본 유저(guest) 가져오기 (없으면 생성)
    const user = await getOrCreateDefaultUser();

    // 5) 예약 생성
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        roomId: Number(roomId),
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: "confirmed", // 일단 바로 'confirmed'로 저장
      },
      include: {
        room: true,
        user: true,
      },
    });

    // 6) 생성된 예약 정보 반환
    res.status(201).json(booking);
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// ===============================
// 5. 예약 목록 조회
// ===============================
//
// GET /bookings
// - 현재는 guest 유저의 예약만 조회
//
app.get("/bookings", async (req, res) => {
  try {
    const user = await getOrCreateDefaultUser();

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
      },
      include: {
        room: {
          include: {
            hotel: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // 최신 예약 먼저
      },
    });

    res.json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// ===============================
// 6. 예약 취소
// ===============================
//
// POST /bookings/:id/cancel
// - 실제로 삭제하는 게 아니라 status 를 'cancelled' 로 바꿔준다.
//
app.post("/bookings/:id/cancel", async (req, res) => {
  try {
    // 1) URL 파라미터에서 예약 id 가져오기
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "잘못된 예약 ID 입니다." });
    }

    // 2) 해당 예약이 실제로 존재하는지 확인
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ error: "예약을 찾을 수 없습니다." });
    }

    // 3) 이미 취소된 예약이면 그대로 반환
    if (booking.status === "cancelled") {
      return res.json(booking);
    }

    // 4) status 를 'cancelled' 로 업데이트
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
      },
    });

    // 5) 업데이트된 예약 정보 반환
    res.json(updated);
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

// ===============================
// 서버 실행
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
