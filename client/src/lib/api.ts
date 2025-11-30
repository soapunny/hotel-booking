// client/src/lib/api.ts
// 백엔드(API 서버)와 통신할 axios 인스턴스를 만들어두는 파일

import axios from "axios";

// .env.development 에서 설정한 VITE_API_URL 을 가져옴.
// 값이 없으면 기본값으로 http://localhost:3000 을 사용.
// client/src/lib/api.ts

// Vite 환경변수에서 API 주소를 읽어온다.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

// 디버깅용: 실제로 어떤 주소를 쓰고 있는지 콘솔에 찍기
//console.log("🔌 API_BASE_URL =", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
