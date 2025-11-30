// client/src/lib/api.ts
// 백엔드(API 서버)와 통신할 axios 인스턴스를 만들어두는 파일

import axios from "axios";

// Vite 환경변수에서 API 주소를 읽어온다.
// .env.development 에서 설정한 VITE_API_URL 을 가져옴.
// 값이 없으면 기본값으로 http://localhost:3000 을 사용.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL,
  // 필요하면 여기서 timeout, headers 등도 설정 가능
});
