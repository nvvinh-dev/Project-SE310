"use client";

import { Button, ErrorAlert, Icons, LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatMeasurementDateTime } from "@/lib/datetime";
import { formatMoney } from "@/lib/format";
import { useCurrentRevenueReport } from "./_lib/revenue-reports-api";
import { buildExcelFile, downloadBlob, printReport, reportTitle, UNPAID_LABEL } from "./_lib/revenue-export";

// SCR-ACC-03 (FR-TUITION-03, FR-TUITION-04): tổng thu tháng hiện tại và số hóa đơn chưa thanh toán, xuất Excel hoặc
// PDF. Không có bộ lọc khoảng ngày (D39 mục 12); chỉ màn hình này có nút xuất (D39 mục 8)
export default function RevenueReportPage() {
  const reportQuery = useCurrentRevenueReport();
  const report = reportQuery.data;

  // Lỗi khi chưa có dữ liệu thì thay cả vùng số liệu; lỗi lúc tải lại thì giữ số liệu cũ và báo ở trên
  const loadError = reportQuery.isError ? toApiError(reportQuery.error).message : null;
  const refresh = () => void reportQuery.refetch();

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl font-bold text-on-surface">
            {report ? reportTitle(report) : "Báo cáo doanh thu"}
          </h1>
          <p className="text-sm text-on-surface-variant">
            Tổng thu của tháng hiện tại theo giờ Việt Nam và số hóa đơn còn chưa thanh toán.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap shrink-0">
          <Button
            variant="outline"
            icon={<Icons.Refresh />}
            onClick={refresh}
            isLoading={reportQuery.isFetching}
            className="min-h-11 sm:min-h-0"
          >
            Làm mới
          </Button>
          {/* Xuất đúng bản đang hiển thị, kể cả lúc đang tải lại; chưa có dữ liệu thì khóa */}
          <Button
            variant="outline"
            icon={<Icons.FileText />}
            disabled={!report}
            onClick={() => {
              if (!report) return;
              const { blob, fileName } = buildExcelFile(report);
              downloadBlob(blob, fileName);
            }}
            className="min-h-11 sm:min-h-0"
          >
            Xuất Excel
          </Button>
          <Button
            variant="outline"
            icon={<Icons.FileText />}
            disabled={!report}
            onClick={() => report && printReport(report)}
            className="min-h-11 sm:min-h-0"
          >
            Xuất PDF
          </Button>
        </div>
      </div>

      {loadError && report && (
        <ErrorAlert title="Không tải lại được báo cáo doanh thu" message={loadError} onRetry={refresh} />
      )}

      {reportQuery.isPending ? (
        <LoadingSpinner label="Đang tải báo cáo doanh thu..." />
      ) : !report ? (
        <ErrorAlert message={loadError ?? ""} onRetry={refresh} />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <section className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-6 shadow-sm space-y-1">
              <h2 className="text-sm font-semibold text-on-surface-variant">Tổng thu trong tháng</h2>
              <p className="text-3xl font-bold text-on-surface wrap-anywhere">{formatMoney(report.totalCollected)}</p>
            </section>
            <section className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-6 shadow-sm space-y-1">
              <h2 className="text-sm font-semibold text-on-surface-variant">{UNPAID_LABEL}</h2>
              <p className="text-3xl font-bold text-on-surface">
                {report.unpaidInvoiceCount.toLocaleString("vi-VN")}{" "}
                <span className="text-base font-semibold text-on-surface-variant">hóa đơn</span>
              </p>
            </section>
          </div>
          <p className="text-sm text-on-surface-variant">Lập lúc {formatMeasurementDateTime(report.generatedAtUtc)}</p>
          <p className="text-xs text-on-surface-variant">
            Xuất Excel tải về file mở được bằng Excel. Xuất PDF mở hộp thoại in, chọn “Lưu dưới dạng PDF”.
          </p>
        </div>
      )}
    </div>
  );
}
