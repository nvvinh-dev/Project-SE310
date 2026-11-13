"use client";

import { useEffect, useState } from "react";
import { NoticeBanner } from "@/components";
import { SchoolClosureForm } from "./_components/SchoolClosureForm";

// SCR-ACC-07 (FR-NOTI-03): Kế toán phát thông báo nghỉ học tới mọi phụ huynh đang hoạt động. Không có danh sách
// thông báo đã gửi; Kế toán không nhận thông báo (Hành vi 3)
export default function SchoolClosurePage() {
  const [notice, setNotice] = useState<string | null>(null);

  // Dải thông báo thành công tự ẩn sau 6 giây (ui-screens.md §4.2)
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <div className="py-8 space-y-6 max-w-3xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-on-surface">Thông báo nghỉ học</h1>
        <p className="text-sm text-on-surface-variant">
          Gửi thông báo nghỉ học tới mọi phụ huynh đang hoạt động. Thông báo đã gửi không sửa và không thu hồi được.
        </p>
      </div>

      {notice && <NoticeBanner message={notice} onClose={() => setNotice(null)} />}

      <SchoolClosureForm
        onStart={() => setNotice(null)}
        onSuccess={(recipientCount) =>
          setNotice(`Đã gửi thông báo nghỉ học tới ${recipientCount.toLocaleString("vi-VN")} phụ huynh.`)
        }
      />
    </div>
  );
}
