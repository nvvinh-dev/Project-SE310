import { INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/types/tuition";

// Tông theo design-system.md §3.2: "Đã thanh toán" tích cực, "Chưa thanh toán" cảnh báo
const STATUS_TONES: Record<InvoiceStatus, { badge: string; dot: string }> = {
  paid: { badge: "bg-primary-fixed/40 text-primary", dot: "bg-primary" },
  unpaid: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-600" },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const tone = STATUS_TONES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true"></span>
      {INVOICE_STATUS_LABELS[status]}
    </span>
  );
}
