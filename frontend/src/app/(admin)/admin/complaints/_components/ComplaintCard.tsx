"use client";

import { Button, Icons } from "@/components";
import { formatMeasurementDateTime } from "@/lib/datetime";
import type { ComplaintResponse, ComplaintStatus } from "@/types/complaint";
import { COMPLAINT_STATUS_LABELS } from "../_lib/complaint-rules";

const STATUS_BADGE_CLASSES: Record<ComplaintStatus, string> = {
  New: "bg-amber-100 text-amber-800",
  InProgress: "bg-primary-fixed/40 text-primary",
  Resolved: "bg-slate-100 text-outline",
};

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_CLASSES[status]}`}
    >
      {COMPLAINT_STATUS_LABELS[status]}
    </span>
  );
}

interface ComplaintCardProps {
  complaint: ComplaintResponse;
  // Đang gửi yêu cầu chuyển trạng thái của chính phản ánh này
  isStarting: boolean;
  // Có thao tác khác đang gửi: khóa nút để không gửi chồng
  isBusy: boolean;
  onStartProgress: (complaint: ComplaintResponse) => void;
  onResolve: (complaint: ComplaintResponse) => void;
}

// Một phản ánh ở SCR-ADM-04 vùng 2. Là thẻ ở mọi cỡ màn hình vì nội dung dài. Không có liên kết sang hồ
// sơ hay dữ liệu khác của trẻ (D40 mục 3, D45). Phản ánh đã xử lý chỉ để xem, không có nút
export function ComplaintCard({ complaint, isStarting, isBusy, onStartProgress, onResolve }: ComplaintCardProps) {
  const isResolved = complaint.status === "Resolved";

  return (
    <article className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-5 shadow-sm space-y-3 min-w-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-on-surface-variant">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-outline" aria-hidden="true">
            <Icons.Clock />
          </span>
          <time dateTime={complaint.createdAtUtc} className="font-semibold text-on-surface">
            {formatMeasurementDateTime(complaint.createdAtUtc)}
          </time>
        </span>
        <ComplaintStatusBadge status={complaint.status} />
        {complaint.resolvedAtUtc && (
          <span>
            Đã xử lý lúc{" "}
            <time dateTime={complaint.resolvedAtUtc}>{formatMeasurementDateTime(complaint.resolvedAtUtc)}</time>
          </span>
        )}
      </div>

      <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
        <dt className="text-on-surface-variant">Trẻ</dt>
        <dd className="font-semibold text-on-surface break-words">
          {complaint.childFullName} · {complaint.className ?? "Chưa xếp lớp"}
        </dd>
        <dt className="text-on-surface-variant">Phụ huynh gửi</dt>
        <dd className="font-semibold text-on-surface break-words">{complaint.submittedByFullName}</dd>
      </dl>

      {/* Nội dung chỉ là chữ, hiện nguyên văn và giữ xuống dòng */}
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-on-surface">{complaint.content}</p>

      {isResolved && complaint.resolution && (
        <div className="rounded-2xl bg-surface-container-low p-3">
          <p className="text-xs font-bold text-on-surface-variant">Kết quả</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-on-surface">
            {complaint.resolution}
          </p>
        </div>
      )}

      {!isResolved && (
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-end">
          {complaint.status === "New" && (
            <Button
              variant="outline"
              size="sm"
              isLoading={isStarting}
              disabled={isBusy}
              onClick={() => onStartProgress(complaint)}
              className="min-h-11 sm:min-h-0"
            >
              Chuyển sang đang xử lý
            </Button>
          )}
          <Button
            size="sm"
            disabled={isBusy}
            onClick={() => onResolve(complaint)}
            className="min-h-11 sm:min-h-0"
          >
            Ghi kết quả
          </Button>
        </div>
      )}
    </article>
  );
}
