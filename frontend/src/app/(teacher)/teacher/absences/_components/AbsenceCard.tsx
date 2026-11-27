import { Button, Icons } from "@/components";
import { formatVietnamTime } from "@/lib/datetime";
import { ABSENCE_FOLLOW_UP_OUTCOME_LABELS, type AbsenceFollowUpOutcome, type AbsenceTodayResponse } from "@/types/absence";
import {
  ABSENCE_CONTACT_STATUS_LABELS,
  getContactStatus,
  getPickupPriorityLabel,
  toTelHref,
  type AbsenceContactStatus,
} from "../_lib/absence-rules";

// Tông theo design-system.md §3.2: không liên lạc được là Lỗi (Ban giám hiệu đã được báo), chưa liên hệ
// là Cảnh báo (việc giáo viên cần làm), liên lạc được là Thành công
const STATUS_TONES: Record<AbsenceContactStatus, { badge: string; dot: string }> = {
  NotContacted: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-600" },
  Unreachable: { badge: "bg-error-container text-on-error-container", dot: "bg-error" },
  Reached: { badge: "bg-primary-fixed/40 text-primary", dot: "bg-primary" },
};

function ContactStatusBadge({ status }: { status: AbsenceContactStatus }) {
  const tone = STATUS_TONES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true"></span>
      {ABSENCE_CONTACT_STATUS_LABELS[status]}
    </span>
  );
}

interface AbsenceCardProps {
  absence: AbsenceTodayResponse;
  disabled: boolean;
  onRecord: (absence: AbsenceTodayResponse, outcome: AbsenceFollowUpOutcome) => void;
}

// Một trẻ ở SCR-TCH-07 vùng 1: họ tên, kết quả sau cùng, người đón chính rồi dự phòng với số điện thoại
// bấm để gọi, hai nút ghi kết quả và các lần liên hệ đã ghi. Không có CCCD hay ảnh khuôn mặt (D45)
export function AbsenceCard({ absence, disabled, onRecord }: AbsenceCardProps) {
  const status = getContactStatus(absence);

  return (
    <article className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-5 shadow-sm space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2 className="min-w-0 break-words wrap-anywhere text-base font-bold text-on-surface">
          {absence.childFullName}
          <span className="font-medium text-on-surface-variant"> · {absence.className}</span>
        </h2>
        <ContactStatusBadge status={status} />
      </div>

      {absence.pickupPersons.length === 0 ? (
        <p className="text-sm text-on-surface-variant">Phụ huynh chưa đăng ký người đón.</p>
      ) : (
        <ul className="space-y-1" aria-label="Người đón">
          {absence.pickupPersons.map((person) => (
            <li
              key={`${person.priority}-${person.phoneNumber}`}
              className="flex flex-wrap items-center justify-between gap-x-3 text-sm min-w-0"
            >
              <p className="min-w-0 break-words wrap-anywhere text-on-surface">
                <span className="text-on-surface-variant">{getPickupPriorityLabel(person.priority)}: </span>
                <span className="font-semibold">{person.fullName}</span>
                <span className="text-on-surface-variant"> ({person.relationship})</span>
              </p>
              <a
                href={toTelHref(person.phoneNumber)}
                aria-label={`Gọi ${person.fullName}, số ${person.phoneNumber}`}
                className="inline-flex min-h-11 sm:min-h-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-primary hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {person.phoneNumber}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => onRecord(absence, "Reached")}
          icon={<Icons.Check />}
          className="min-h-11 sm:min-h-0"
        >
          Đã liên lạc được
        </Button>
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => onRecord(absence, "Unreachable")}
          icon={<Icons.Alert />}
          className="min-h-11 sm:min-h-0"
        >
          Không liên lạc được
        </Button>
      </div>

      {absence.followUps.length > 0 && (
        <ol className="space-y-2 border-t border-slate-100 pt-3" aria-label="Các lần liên hệ">
          {absence.followUps.map((followUp, index) => (
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
