import { COMPLAINT_STATUS_LABELS, type ComplaintStatus } from "@/types/complaint";

// Tông theo design-system.md §3.2: đã xử lý là việc đã xong (Tích cực); phản ánh mới cần Ban giám hiệu
// để ý (Cảnh báo); đang xử lý là chưa xong (Trung tính). Bảng gán tông §3.2 chưa có phản ánh.
// Dùng chung cho SCR-ADM-04 (Admin) và SCR-PAR-09 (Phụ huynh)
const STATUS_TONES: Record<ComplaintStatus, { badge: string; dot: string }> = {
  New: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-600" },
  // Chữ dùng on-surface-variant: text-outline trên nền slate-100 chỉ đạt tương phản 4.08 (< 4.5, WCAG AA)
  InProgress: { badge: "bg-slate-100 text-on-surface-variant", dot: "bg-outline" },
  Resolved: { badge: "bg-primary-fixed/40 text-primary", dot: "bg-primary" },
};

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  const tone = STATUS_TONES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true"></span>
      {COMPLAINT_STATUS_LABELS[status]}
    </span>
  );
}
