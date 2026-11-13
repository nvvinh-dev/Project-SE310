"use client";

import { Icons } from "@/components";

interface HealthNotesCardProps {
  healthNotes: string | null | undefined;
}

// SCR-PAR-03 Vùng [2]: Lưu ý sức khỏe của con
// AC-HEALTH-10, AC-HEALTH-12: Chỉ xem, kèm dòng nhắc báo bộ phận Y tế khi sai hoặc thiếu
export function HealthNotesCard({ healthNotes }: HealthNotesCardProps) {
  const hasNotes = Boolean(healthNotes && healthNotes.trim().length > 0);

  return (
    <div
      className={`rounded-3xl p-4 shadow-xs border transition-colors ${
        hasNotes
          ? "border-amber-600/30 bg-amber-100 text-amber-800"
          : "border-slate-200/90 bg-surface-container-lowest text-on-surface"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`shrink-0 mt-0.5 ${hasNotes ? "text-amber-600" : "text-outline"}`}
          aria-hidden="true"
        >
          {hasNotes ? <Icons.Alert /> : <Icons.Clipboard />}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="text-sm">
            <span className="font-semibold text-on-surface">Lưu ý sức khỏe:&nbsp;</span>
            {hasNotes ? (
              <span className="font-medium text-amber-800 whitespace-pre-wrap break-words">
                {healthNotes}
              </span>
            ) : (
              <span className="text-outline font-normal">Chưa có lưu ý sức khỏe</span>
            )}
          </div>

          <p className="text-xs text-on-surface-variant">
            Lưu ý sai hoặc còn thiếu? Báo bộ phận Y tế của trường để cập nhật.
          </p>
        </div>
      </div>
    </div>
  );
}
