// client/src/components/Toast.tsx
// 토스트 알림 컴포넌트

import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  duration?: number; // 화면에 보여줄 시간(ms) - 기본 2500ms
  onClose: () => void;
}

export default function Toast({
  message,
  type = "success",
  duration = 2500,
  onClose,
}: ToastProps) {
  // message가 생길 때마다 타이머 설정 -> duration 후에 자동으로 onClose 호출
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // message / duration / onClose 가 바뀌면 기존 타이머 정리
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  // message 없으면 렌더링 안 함
  if (!message) return null;

  const bgColor =
    type === "success"
      ? "rgba(34, 197, 94, 0.9)" // 초록색
      : "rgba(248, 113, 113, 0.9)"; // 빨간색

  return (
    <div
      className="toast"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        padding: "12px 18px",
        borderRadius: "8px",
        color: "#fff",
        backgroundColor: bgColor,
        fontSize: "14px",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.35)",
        zIndex: 9999,
        cursor: "pointer",
        maxWidth: "280px",
        lineHeight: 1.5,
      }}
      onClick={onClose} // 클릭하면 바로 닫기
    >
      {message}
    </div>
  );
}
