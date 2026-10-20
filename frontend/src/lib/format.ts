// Định dạng số đo theo quy chuẩn tiếng Việt (frontend-conventions.md §6)

// Định dạng số đo với dấu phẩy kiểu Việt Nam, null hiện "—"
export function formatHeight(height: number | null): string {
  if (height === null || height === undefined) return "—";
  const str = height.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${str} cm`;
}

export function formatWeight(weight: number | null): string {
  if (weight === null || weight === undefined) return "—";
  const str = weight.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${str} kg`;
}
