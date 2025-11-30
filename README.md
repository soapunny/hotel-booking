# https://hotel-booking-bay-rho.vercel.app

# Hotel Booking App (Fullstack)

React + Node.js + Prisma + MariaDB로 만든 **풀스택 호텔 예약 웹 애플리케이션** 입니다.  
호텔 및 객실 조회, 날짜 선택, 예약 생성, 예약 목록 조회, 예약 취소까지 **실제 서비스 흐름 전체를 구현** 했습니다.

---

## 주요 기능

- 호텔 목록 조회
- 객실 목록 조회
- 체크인 / 체크아웃 날짜 선택
- 객실 예약 생성
- 내 예약 목록 조회
- 예약 취소 (status 기반)
- DB 상태에 따른 UI 반영

---

## 기술 스택

### Frontend

- React
- TypeScript
- Vite
- Axios

### Backend

- Node.js
- Express

### Database & ORM

- MariaDB
- Prisma ORM

### DevOps (예정)

- GitHub
- Vercel (Frontend)
- Render (Backend)

---

## 프로젝트 구조

```text
hotel_booking
├─ client/          # React Frontend
│  ├─ src/
│  ├─ package.json
│  └─ vite.config.ts
│
├─ server/          # Node.js Backend
│  ├─ src/
│  │  └─ index.js
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ .env
│  └─ package.json
│
└─ README.md
```
