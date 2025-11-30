// client/src/types.ts

// 호텔 1개에 대한 타입
export interface Room {
  id: number;
  hotelId: number;
  roomNumber: string;
  type: string;
  price: number;
  hotel?: Hotel;
}

export interface Hotel {
  id: number;
  name: string;
  city: string;
  address: string;
  createdAt: string; // ISO 문자열 (백엔드에서 Date → string)
  rooms: Room[];
}

// 예약 1개에 대한 타입
export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  checkIn: string; // ISO 문자열
  checkOut: string; // ISO 문자열
  status: "confirmed" | "cancelled";

  // 프론트에서 보기 좋게 하기 위해 relation들도 포함
  room?: Room;
  hotel?: Hotel;
}
