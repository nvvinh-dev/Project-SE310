"use client";

import Link from "next/link";
import { Icons } from "@/components";

interface HealthNoteCardProps {
  healthNotes: string | null | undefined;
}

// SCR-MED-02 Vùng 2: Lưu ý sức khỏe của trẻ đang chọn
// Nếu có lưu ý: hiển thị tông Cảnh báo (bg-amber-100 text-amber-800 border-amber-600/30, icon Alert)
// Nếu không có: hiển thị "Không có lưu ý" với màu trung tính text-outline
export function HealthNoteCard({ healthNotes }: HealthNoteCardProps) {
  const hasNotes = Boolean(healthNotes && healthNotes.trim().length > 0);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl p-4 shadow-xs border transition-colors ${
        hasNotes
          ? "border-amber-600/30 bg-amber-100"
          : "border-slate-200/90 bg-surface-container-lowest"
      }`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {hasNotes ? (
          <div className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true">
            <Icons.Alert />
          </div>
        ) : (
          <div className="text-outline shrink-0 mt-0.5" aria-hidden="true">
            <Icons.Clipboard />
          </div>
        )}

        <div className="text-sm min-w-0">
          <span className="font-semibold text-on-surface">Lưu ý sức khỏe:&nbsp;</span>
          {hasNotes ? (
            <span className="text-amber-800 font-medium whitespace-pre-wrap break-words">
              {healthNotes}
            </span>
          ) : (
            <span className="text-outline font-normal">Không có lưu ý</span>
          )}
        </div>
      </div>

      <Link
        href="/medical/health-notes"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline shrink-0 self-end sm:self-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
      >
        <span>Sửa lưu ý</span>
        <Icons.ChevronRight />
      </Link>
    </div>
  );
}
