"use client";

import { Icons } from "@/components";

// Dải thông báo ghi thành công (ui-screens.md §4.2, khuôn của SCR-ADM-02), dùng ở trang và trong hộp
// thoại phụ huynh. Tạm đặt ở đây; khi NoticeBanner của src/components/ vào develop thì dùng bản đó
export function NoticeBanner({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-primary/20 bg-primary-fixed/30 p-4 flex items-start justify-between gap-3"
    >
      <div className="flex items-start gap-3">
        <span className="text-primary shrink-0">
          <Icons.Check />
        </span>
        <p className="text-sm font-semibold text-on-surface break-words">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng thông báo"
        className="shrink-0 p-1 rounded-full text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
      >
        <Icons.Close />
      </button>
    </div>
  );
}
