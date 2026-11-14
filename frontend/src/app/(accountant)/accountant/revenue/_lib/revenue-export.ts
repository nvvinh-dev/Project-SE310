import { formatMeasurementDateTime } from "@/lib/datetime";
import { formatMoney } from "@/lib/format";
import type { RevenueReportResponse } from "@/types/revenue";

// FR-TUITION-04: xuất đúng dữ liệu đang hiển thị, không gọi thêm API (SCR-ACC-03, Hành vi 4). Không dùng thư viện
// (D35): Excel nhận file văn bản, PDF đi qua hộp thoại in của trình duyệt

export function reportTitle(report: RevenueReportResponse): string {
  return `Báo cáo doanh thu tháng ${String(report.month).padStart(2, "0")}/${report.year}`;
}

export const UNPAID_LABEL = "Hóa đơn chưa thanh toán (tất cả các kỳ)";

function fileBaseName(report: RevenueReportResponse): string {
  return `bao-cao-doanh-thu-${report.year}-${String(report.month).padStart(2, "0")}`;
}

// Các dòng của báo cáo, dùng chung cho file Excel và trang in để hai bản luôn cùng nội dung
function reportRows(report: RevenueReportResponse): { label: string; value: string; raw: string }[] {
  return [
    {
      label: "Tổng thu trong tháng",
      value: formatMoney(report.totalCollected),
      // Số thô để Excel tính toán được; đơn vị ghi ở nhãn
      raw: String(report.totalCollected),
    },
    {
      label: UNPAID_LABEL,
      value: `${report.unpaidInvoiceCount.toLocaleString("vi-VN")} hóa đơn`,
      raw: String(report.unpaidInvoiceCount),
    },
    { label: "Lập lúc", value: formatMeasurementDateTime(report.generatedAtUtc), raw: "" },
  ];
}

// Excel đọc dấu phân cách của file .csv theo cài đặt vùng của Windows (máy tiếng Việt thường là ";"), nên file
// ngăn bằng dấu phẩy có thể dồn vào một cột. File UTF-16LE có BOM, ngăn bằng tab thì Excel mở đúng cột và đúng tiếng
// Việt ở mọi cài đặt vùng
export function buildExcelFile(report: RevenueReportResponse): { blob: Blob; fileName: string } {
  const clean = (text: string) => text.replace(/[\t\r\n]+/g, " ");
  const rows = reportRows(report);
  const lines = [
    [reportTitle(report)],
    [],
    ["Chỉ tiêu", "Giá trị"],
    [`${rows[0].label} (đồng)`, rows[0].raw],
    [rows[1].label, rows[1].raw],
    [rows[2].label, rows[2].value],
  ];
  const text = lines.map((cells) => cells.map(clean).join("\t")).join("\r\n");

  const bytes = new Uint8Array(2 + text.length * 2);
  bytes[0] = 0xff;
  bytes[1] = 0xfe;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    bytes[2 + i * 2] = code & 0xff;
    bytes[3 + i * 2] = code >> 8;
  }
  return { blob: new Blob([bytes], { type: "text/csv;charset=utf-16le" }), fileName: `${fileBaseName(report)}.csv` };
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

// Trang in độc lập, không kèm khung trang (menu, thanh trên). Font hệ thống, không nạp gì từ CDN (D11)
export function buildPrintHtml(report: RevenueReportResponse): string {
  const title = escapeHtml(reportTitle(report));
  const rows = reportRows(report)
    .map((row) => `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>${escapeHtml(fileBaseName(report))}</title>
<style>
  @page { size: A4; margin: 20mm; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: black; margin: 0; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  p { font-size: 12px; color: dimgray; margin: 0 0 16px; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { border: 1px solid gray; padding: 8px 12px; text-align: left; }
  th { width: 55%; font-weight: 600; background: whitesmoke; }
</style>
</head>
<body>
<h1>${title}</h1>
<p>Hệ thống quản lý nhà trẻ</p>
<table>${rows}</table>
</body>
</html>`;
}

// Dựng trang in trong iframe ẩn rồi mở hộp thoại in; người dùng chọn "Lưu dưới dạng PDF". Dùng iframe thay cửa sổ
// mới để trình duyệt không chặn pop-up
const PRINT_FRAME_ID = "revenue-report-print-frame";

export function printReport(report: RevenueReportResponse) {
  // Trình duyệt không bắn afterprint thì frame lần trước còn lại: gỡ trước khi tạo frame mới
  document.getElementById(PRINT_FRAME_ID)?.remove();
  const frame = document.createElement("iframe");
  frame.id = PRINT_FRAME_ID;
  frame.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  frame.style.position = "fixed";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return;
    win.addEventListener("afterprint", () => frame.remove());
    win.focus();
    win.print();
  };
  frame.srcdoc = buildPrintHtml(report);
  document.body.appendChild(frame);
}
