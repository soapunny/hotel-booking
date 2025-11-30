// client/src/components/HotelList.tsx
import React from "react";
import type { Hotel, Room } from "../types";

interface HotelListProps {
  hotels: Hotel[];
  onBook: (room: Room) => void;
  isLoading: boolean;
  error: string | null;
}

export function HotelList({
  hotels,
  onBook,
  isLoading,
  error,
}: HotelListProps) {
  if (isLoading) {
    return <p style={{ marginTop: 16 }}>호텔 목록을 불러오는 중입니다...</p>;
  }

  if (error) {
    return (
      <p style={{ marginTop: 16, color: "#f87171" }}>
        호텔 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.
      </p>
    );
  }

  if (hotels.length === 0) {
    return <p style={{ marginTop: 16 }}>현재 예약 가능한 호텔이 없습니다.</p>;
  }

  return (
    <>
      {hotels.map((hotel) => (
        <section
          key={hotel.id}
          style={{
            backgroundColor: "#111827",
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>{hotel.name}</h2>
          <p style={{ color: "#9ca3af", marginBottom: 12 }}>
            {hotel.city} · {hotel.address}
          </p>

          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>방 목록</h3>
          {hotel.rooms.map((room) => (
            <div
              key={room.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderTop: "1px solid #1f2937",
              }}
            >
              <div>
                <div>
                  {room.roomNumber}호 · {room.type}
                </div>
                <div style={{ fontSize: 14, color: "#9ca3af" }}>
                  {room.price.toLocaleString()}원 / 박
                </div>
              </div>
              <button
                onClick={() => onBook(room)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  backgroundColor: "#22c55e",
                  color: "#fff",
                  border: "none",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                예약하기
              </button>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
