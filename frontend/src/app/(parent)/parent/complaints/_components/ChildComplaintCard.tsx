import { ComplaintStatusBadge, Icons } from "@/components";
import { formatMeasurementDateTime } from "@/lib/datetime";
import type { ChildComplaintResponse } from "@/types/complaint";

// Một phản ánh ở SCR-PAR-09 vùng 3. Chỉ để xem: không có nút sửa hay xóa (Hành vi 4). Không có người
// gửi hay người xử lý vì response không trả (D45)
export function ChildComplaintCard({ complaint }: { complaint: ChildComplaintResponse }) {
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

      {/* Nội dung chỉ là chữ, hiện nguyên văn và giữ xuống dòng */}
      <p className="whitespace-pre-wrap break-words wrap-anywhere text-sm leading-relaxed text-on-surface">
        {complaint.content}
      </p>

      {complaint.status === "Resolved" && complaint.resolution && (
        <div className="rounded-2xl bg-surface-container-low p-3">
          <p className="text-xs font-bold text-on-surface-variant">Kết quả</p>
          <p className="mt-1 whitespace-pre-wrap break-words wrap-anywhere text-sm leading-relaxed text-on-surface">
            {complaint.resolution}
          </p>
        </div>
      )}
    </article>
  );
}
