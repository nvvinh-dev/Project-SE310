// Phản chiếu RevenueReportResponse (NhaTre.Application/DTOs/Tuition). Kỳ báo cáo luôn là tháng hiện tại theo giờ
// Việt Nam (D39 mục 12): [periodStartUtc, periodEndUtc), nên periodEndUtc là 00:00 ngày 01 tháng sau, không dùng
// làm "đến ngày" (ui-screens.md SCR-ACC-03, Hành vi 1)
export interface RevenueReportResponse {
  year: number;
  month: number;
  periodStartUtc: string;
  periodEndUtc: string;
  generatedAtUtc: string;
  // Tổng các khoản đã ghi nhận thanh toán trong tháng
  totalCollected: number;
  // Mọi hóa đơn còn chưa thanh toán, không lọc theo tháng
  unpaidInvoiceCount: number;
}
