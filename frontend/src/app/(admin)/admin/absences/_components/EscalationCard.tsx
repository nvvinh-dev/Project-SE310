import { Icons } from "@/components";
import { formatVietnamTime } from "@/lib/datetime";
import { ABSENCE_FOLLOW_UP_OUTCOME_LABELS, type AbsenceEscalationResponse } from "@/types/absence";
import { ESCALATION_STATUS_LABELS, getEscalationStatus, type EscalationStatus } from "../_lib/absence-rules";

// Tông theo design-system.md §3.2: không liên lạc được là việc cần Ban giám hiệu xử lý ngay (Lỗi);
// chưa liên hệ là cần để ý (Cảnh báo). Badge chỉ hiện trạng thái sau cùng, mà backend không trả trẻ có
// lần sau cùng là liên lạc được, nên tông Reached không hiện ra; chỉ giữ cho đủ khóa của EscalationStatus
const STATUS_TONES: Record<EscalationStatus, { badge: string; dot: string }> = {
  Unreachable: { badge: "bg-error-container text-on-error-container", dot: "bg-error" },
  NotContacted: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-600" },
  Reached: { badge: "bg-primary-fixed/40 text-primary", dot: "bg-primary" },
};

function EscalationStatusBadge({ status }: { status: EscalationStatus }) {
  const tone = STATUS_TONES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true"></span>
      {ESCALATION_STATUS_LABELS[status]}
    </span>
  );
}

// Một trẻ ở SCR-ADM-06 vùng 1: họ tên, lớp, kết quả sau cùng và các lần liên hệ theo thứ tự ghi. Chỉ xem,
// không có nút hay liên kết sang dữ liệu khác của trẻ (D39 mục 15, D40 mục 3)
export function EscalationCard({ escalation }: { escalation: AbsenceEscalationResponse }) {
  const status = getEscalationStatus(escalation);

  return (
    <article className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-5 shadow-sm space-y-3 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2 className="min-w-0 break-words text-base font-bold text-on-surface">
          {escalation.childFullName}
          <span className="font-medium text-on-surface-variant"> · {escalation.className}</span>
        </h2>
        <EscalationStatusBadge status={status} />
      </div>

      {escalation.followUps.length === 0 ? (
        <p className="text-sm text-on-surface-variant">Giáo viên chưa ghi lần liên hệ nào.</p>
      ) : (
        <ol className="space-y-2 border-t border-slate-100 pt-3" aria-label="Các lần liên hệ">
          {escalation.followUps.map((followUp, index) => (
            <li key={`${followUp.recordedAtUtc}-${index}`} className="flex gap-3 text-sm min-w-0">
              <span className="mt-0.5 shrink-0 text-outline" aria-hidden="true">
                <Icons.Clock />
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-on-surface">
                  <time dateTime={followUp.recordedAtUtc} className="font-semibold">
                    {formatVietnamTime(followUp.recordedAtUtc)}
                  </time>{" "}
                  <span className="font-semibold">{ABSENCE_FOLLOW_UP_OUTCOME_LABELS[followUp.outcome]}</span>
                  <span className="text-on-surface-variant"> — {followUp.recordedByTeacherName}</span>
                </p>
                {followUp.note && (
                  <p className="whitespace-pre-wrap break-words wrap-anywhere leading-relaxed text-on-surface-variant">
                    “{followUp.note}”
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
