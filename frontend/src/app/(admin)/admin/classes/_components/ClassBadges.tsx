// Tên lớp là phân loại nên dùng tông Thông tin; chưa có lớp, chưa có giáo viên chủ nhiệm dùng tông
// Trung tính (design-system.md §3.2)
export function ClassNameBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-surface-container-low px-2.5 py-1 text-xs font-semibold text-secondary">
      {name}
    </span>
  );
}

export function MissingBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-outline">
      <span className="h-1.5 w-1.5 rounded-full bg-outline" aria-hidden="true"></span>
      {label}
    </span>
  );
}

// Lớp hiện tại của trẻ, hoặc "Chưa xếp" khi trẻ chưa có lớp
export function PlacementClassBadge({ name }: { name: string | null }) {
  return name ? <ClassNameBadge name={name} /> : <MissingBadge label="Chưa xếp" />;
}
