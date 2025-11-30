// client/src/lib/api.ts
import axios from "axios";
import type { Hotel, Booking } from "../types";

// .env.development 에서 API 주소 읽기
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

console.log("🔌 API_BASE_URL =", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ===============================
// 호텔 관련 API
// ===============================
export async function fetchHotels(): Promise<Hotel[]> {
  const res = await api.get<Hotel[]>("/hotels");
  return res.data;
}

// ===============================
// 예약 관련 API
// ===============================
export interface CreateBookingPayload {
  roomId: number;
  checkIn: string; // "YYYY-MM-DD"
  checkOut: string; // "YYYY-MM-DD"
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const res = await api.get<Booking[]>("/bookings");
  return res.data;
}

export async function createBooking(
  payload: CreateBookingPayload
): Promise<Booking> {
  const res = await api.post<Booking>("/bookings", payload);
  return res.data;
}

export async function cancelBooking(bookingId: number): Promise<Booking> {
  const res = await api.post<Booking>(`/bookings/${bookingId}/cancel`);
  return res.data;
}

export default api;
