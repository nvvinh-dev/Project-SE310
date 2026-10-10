import { ROLE_VIETNAMESE_LABELS } from "@/components/DashboardLayout";
import type { Role } from "@/types/auth";

export function RoleBadge({ role }: { role: Role }) {
  const colorClass =
    role === "Admin"
      ? "bg-primary-fixed/70 text-on-primary-fixed"
      : "bg-surface-container-low text-secondary";

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${colorClass}`}>
      {ROLE_VIETNAMESE_LABELS[role]}
    </span>
  );
}

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-fixed/40 px-2.5 py-1 text-xs font-semibold text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true"></span>
      Đang hoạt động
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-outline">
      <span className="h-1.5 w-1.5 rounded-full bg-outline" aria-hidden="true"></span>
      Đã vô hiệu hóa
    </span>
  );
}
