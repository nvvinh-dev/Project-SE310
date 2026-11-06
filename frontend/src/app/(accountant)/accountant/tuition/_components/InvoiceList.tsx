"use client";

import {
  Button,
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableError,
  TableHead,
  TableHeader,
  TableLoading,
  TableRow,
} from "@/components";
// Hàm chung đổi thời điểm Utc sang dd/MM/yyyy HH:mm giờ Việt Nam (ui-screens.md §4.4), không riêng cho số đo
import { formatMeasurementDateTime } from "@/lib/datetime";
import { formatMoney } from "@/lib/format";
import type { InvoiceResponse } from "@/types/tuition";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

// Cỡ trang mặc định của frontend-conventions.md §3.4; SCR-ACC-02 không ghi cỡ riêng
export const INVOICE_PAGE_SIZE = 20;
const TABLE_COLUMNS = 6;

interface InvoiceListProps {
  // undefined là chưa tải được lần nào
  invoices: InvoiceResponse[] | undefined;
  isInitialLoading: boolean;
  // Lỗi thay cả danh sách, chỉ khi chưa có dữ liệu
  fullError: string | null;
  onRetry: () => void;
  hasFilters: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (invoice: InvoiceResponse) => void;
  onRecordPayment: (invoice: InvoiceResponse) => void;
}

// Hóa đơn "Đã thanh toán" không có thao tác: không sửa (BR-TUITION-12), không ghi nhận lại (AC-TUITION-11)
function InvoiceActions({
  invoice,
  onEdit,
  onRecordPayment,
}: {
  invoice: InvoiceResponse;
  onEdit: (invoice: InvoiceResponse) => void;
  onRecordPayment: (invoice: InvoiceResponse) => void;
}) {
  if (invoice.status === "paid") return <span className="text-on-surface-variant">—</span>;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => onEdit(invoice)} className="min-h-11 sm:min-h-0">
        Sửa
      </Button>
      <Button size="sm" onClick={() => onRecordPayment(invoice)} className="min-h-11 sm:min-h-0">
        Ghi nhận đã thu
      </Button>
    </div>
  );
}

export function InvoiceList({
  invoices,
  isInitialLoading,
  fullError,
  onRetry,
  hasFilters,
  page,
  onPageChange,
  onEdit,
  onRecordPayment,
}: InvoiceListProps) {
  const allInvoices = invoices ?? [];

  // Giữ thứ tự backend trả về (mới lập trước). Danh sách ngắn lại sau khi tải lại thì không đứng ở trang đã hết
  // dữ liệu
  const totalPages = Math.max(1, Math.ceil(allInvoices.length / INVOICE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageInvoices = allInvoices.slice((currentPage - 1) * INVOICE_PAGE_SIZE, currentPage * INVOICE_PAGE_SIZE);

  const emptyTitle = hasFilters ? "Không có hóa đơn khớp bộ lọc" : "Chưa có hóa đơn nào";
  const emptyMessage = hasFilters
    ? "Chọn trẻ hay trạng thái khác, hoặc bấm “Xóa bộ lọc” để xem mọi hóa đơn."
    : "Bấm “Lập hóa đơn” để lập hóa đơn đầu tiên cho trẻ.";

  return (
    <div className="space-y-2">
      {/* Màn hình rộng (từ 1280px): bảng */}
      <div className="hidden xl:block">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Ngày lập</TableHead>
              <TableHead>Trẻ</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {isInitialLoading ? (
              <TableLoading colSpan={TABLE_COLUMNS} />
            ) : fullError !== null ? (
              <TableError colSpan={TABLE_COLUMNS} message={fullError} onRetry={onRetry} />
            ) : pageInvoices.length === 0 ? (
              <TableEmpty colSpan={TABLE_COLUMNS} title={emptyTitle} message={emptyMessage} />
            ) : (
              pageInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-on-surface-variant whitespace-nowrap">
                    {formatMeasurementDateTime(invoice.issuedAtUtc)}
                  </TableCell>
                  <TableCell className="font-semibold break-words">{invoice.childFullName}</TableCell>
                  <TableCell className="max-w-xs whitespace-pre-wrap break-words">{invoice.description}</TableCell>
                  <TableCell className="font-semibold whitespace-nowrap">
                    {formatMoney(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>
                    <InvoiceActions invoice={invoice} onEdit={onEdit} onRecordPayment={onRecordPayment} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dưới 1280px (tablet, điện thoại, laptop nhỏ có sidebar): mỗi hóa đơn một thẻ */}
      <div className="xl:hidden">
        {isInitialLoading ? (
          <LoadingSpinner label="Đang tải danh sách hóa đơn..." />
        ) : fullError !== null ? (
          <ErrorAlert message={fullError} onRetry={onRetry} />
        ) : pageInvoices.length === 0 ? (
          <EmptyState title={emptyTitle} message={emptyMessage} />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {pageInvoices.map((invoice) => (
              <li
                key={invoice.id}
                className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-semibold text-on-surface break-words">{invoice.childFullName}</p>
                    <p className="text-xs text-on-surface-variant">
                      Lập lúc {formatMeasurementDateTime(invoice.issuedAtUtc)}
                    </p>
                  </div>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <p className="text-sm text-on-surface whitespace-pre-wrap break-words">{invoice.description}</p>
                <p className="text-lg font-bold text-on-surface">{formatMoney(invoice.amount)}</p>
                {invoice.status === "unpaid" && (
                  <InvoiceActions invoice={invoice} onEdit={onEdit} onRecordPayment={onRecordPayment} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chỉ hiện khi có hơn một trang và đã có dữ liệu (frontend-conventions.md §3.4) */}
      {!isInitialLoading && fullError === null && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={allInvoices.length}
          pageSize={INVOICE_PAGE_SIZE}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
