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

// Số tiền theo vi-VN, đơn vị đồng: 1500000 → "1.500.000 ₫" (ui-screens.md §4.4). Giữ phần lẻ nếu có, vì
// cột numeric(12,2) cho phép 2 chữ số thập phân
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatWeight(weight: number | null): string {
  if (weight === null || weight === undefined) return "—";
  const str = weight.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${str} kg`;
}
