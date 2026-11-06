"use client";

import { useEffect, useState } from "react";
import { Button, ErrorAlert, Icons, NoticeBanner, Select } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatMoney } from "@/lib/format";
import {
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type InvoiceResponse,
  type InvoiceStatus,
  type TuitionFeeResponse,
} from "@/types/tuition";
import { useChildren } from "../students/_lib/children-api";
import { useInvoices, useTuitionFee } from "./_lib/tuition-api";
import { InvoiceFormModal, type InvoiceFormTarget } from "./_components/InvoiceFormModal";
import { InvoiceList } from "./_components/InvoiceList";
import { RecordPaymentModal } from "./_components/RecordPaymentModal";
import { TuitionFeeCard } from "./_components/TuitionFeeCard";
import { TuitionFeeModal } from "./_components/TuitionFeeModal";

const ALL = "";

const STATUS_FILTER_OPTIONS = [
  { value: ALL, label: "Tất cả trạng thái" },
  { value: "unpaid", label: INVOICE_STATUS_LABELS.unpaid },
  { value: "paid", label: INVOICE_STATUS_LABELS.paid },
];

function isInvoiceStatus(value: string): value is InvoiceStatus {
  return value === "unpaid" || value === "paid";
}

// SCR-ACC-02: biểu phí chung, hóa đơn từng trẻ và ghi nhận đã thu (FR-TUITION-01, 02, 06). Không xóa biểu phí,
// không xóa hóa đơn (D40 mục 1)
export default function TuitionPage() {
  const feeQuery = useTuitionFee();
  const childrenQuery = useChildren();

  const [childId, setChildId] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  // Chụp biểu phí lúc mở hộp thoại: null là tạo, có giá trị là sửa. Không đọc thẳng từ query, vì 409 khi tạo làm
  // biểu phí tải lại có giá trị và hộp thoại sẽ chuyển sang sửa, mất message 409 và Lưu tiếp sẽ ghi đè biểu phí có sẵn
  const [feeFormTarget, setFeeFormTarget] = useState<{ fee: TuitionFeeResponse | null } | null>(null);
  const [invoiceTarget, setInvoiceTarget] = useState<InvoiceFormTarget | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceResponse | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filters = { childId: childId === ALL ? null : childId, status: isInvoiceStatus(status) ? status : null };
  const hasFilters = filters.childId !== null || filters.status !== null;
  const invoicesQuery = useInvoices(filters);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  const fee = feeQuery.data;
  const invoices = invoicesQuery.data;

  // Lỗi khi chưa có dữ liệu thì thay cả danh sách; lỗi lúc tải lại thì giữ danh sách cũ và báo ở trên
  const loadError = invoicesQuery.isError ? toApiError(invoicesQuery.error).message : null;
  const retryInvoices = () => void invoicesQuery.refetch();

  // Danh sách trẻ cho ô lọc: cùng cách báo lỗi như danh sách hóa đơn (frontend-conventions.md §3.3). Chưa tải được
  // lần nào thì ô lọc chỉ còn "Tất cả trẻ"; đã có thì giữ danh sách cũ
  const childrenError = childrenQuery.isError ? toApiError(childrenQuery.error).message : null;
  const retryChildren = () => void childrenQuery.refetch();

  // Đổi bộ lọc thì về trang 1 (frontend-conventions.md §3.4)
  const changeChildFilter = (value: string) => {
    setChildId(value);
    setPage(1);
  };
  const changeStatusFilter = (value: string) => {
    setStatus(value);
    setPage(1);
  };
  const clearFilters = () => {
    setChildId(ALL);
    setStatus(ALL);
    setPage(1);
  };

  const openInvoiceForm = (target: InvoiceFormTarget) => {
    setNotice(null);
    setInvoiceTarget(target);
  };

  const childOptions = [
    { value: ALL, label: "Tất cả trẻ" },
    ...(childrenQuery.data ?? []).map((child) => ({ value: child.id, label: child.fullName })),
  ];

  return (
    <div className="py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-on-surface">Học phí và hóa đơn</h1>
        <p className="text-sm text-on-surface-variant">
          Đặt biểu phí chung, lập hóa đơn cho từng trẻ và ghi nhận khi phụ huynh đã nộp tiền mặt hay chuyển khoản.
        </p>
      </div>

      {notice && <NoticeBanner message={notice} onClose={() => setNotice(null)} />}

      <TuitionFeeCard
        onOpenFeeForm={(currentFee) => {
          setNotice(null);
          setFeeFormTarget({ fee: currentFee });
        }}
      />

      <section aria-labelledby="invoices-heading" className="space-y-4">
        <h2 id="invoices-heading" className="text-lg font-bold text-on-surface">
          Hóa đơn
        </h2>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
            <div className="sm:w-56">
              <Select
                aria-label="Lọc theo trẻ"
                options={childOptions}
                value={childId}
                disabled={childrenQuery.isPending}
                onChange={(event) => changeChildFilter(event.target.value)}
              />
            </div>
            <div className="sm:w-52">
              <Select
                aria-label="Lọc theo trạng thái"
                options={STATUS_FILTER_OPTIONS}
                value={status}
                onChange={(event) => changeStatusFilter(event.target.value)}
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="self-start sm:self-auto min-h-11 sm:min-h-0">
                Xóa bộ lọc
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-1.5 lg:items-end shrink-0">
            {/* Chưa có biểu phí thì không lập được hóa đơn (backend trả 409): khóa nút và nhắc tạo biểu phí trước */}
            <Button
              icon={<Icons.FileText />}
              disabled={!fee}
              onClick={() => fee && openInvoiceForm({ mode: "create", fee })}
              className="self-start lg:self-auto whitespace-nowrap min-h-11 sm:min-h-0"
            >
              Lập hóa đơn
            </Button>
            {fee === null && (
              <p className="text-xs text-on-surface-variant">Tạo biểu phí trước khi lập hóa đơn.</p>
            )}
          </div>
        </div>

        {childrenError && (
          <ErrorAlert
            title={
              childrenQuery.data === undefined
                ? "Không tải được danh sách trẻ để lọc"
                : "Không tải lại được danh sách trẻ để lọc"
            }
            message={childrenError}
            onRetry={retryChildren}
          />
        )}

        {loadError && invoices && (
          <ErrorAlert title="Không tải lại được danh sách hóa đơn" message={loadError} onRetry={retryInvoices} />
        )}

        <InvoiceList
          invoices={invoices}
          isInitialLoading={invoicesQuery.isPending}
          fullError={loadError !== null && !invoices ? loadError : null}
          onRetry={retryInvoices}
          hasFilters={hasFilters}
          page={page}
          onPageChange={setPage}
          onEdit={(invoice) => openInvoiceForm({ mode: "edit", invoice })}
          onRecordPayment={(invoice) => {
            setNotice(null);
            setPaymentInvoice(invoice);
          }}
        />
      </section>

      {feeFormTarget && (
        <TuitionFeeModal
          fee={feeFormTarget.fee}
          onClose={() => setFeeFormTarget(null)}
          onSuccess={(_, isCreate) => {
            setFeeFormTarget(null);
            setNotice(isCreate ? "Đã tạo biểu phí." : "Đã lưu biểu phí. Hóa đơn đã lập không đổi.");
          }}
        />
      )}

      {invoiceTarget && (
        <InvoiceFormModal
          target={invoiceTarget}
          onClose={() => setInvoiceTarget(null)}
          onSuccess={(invoice, isCreate) => {
            setInvoiceTarget(null);
            setNotice(
              isCreate
                ? `Đã lập hóa đơn cho ${invoice.childFullName}. Phụ huynh của trẻ sẽ nhận thông báo.`
                : `Đã lưu hóa đơn của ${invoice.childFullName}.`
            );
          }}
        />
      )}

      {paymentInvoice && (
        <RecordPaymentModal
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={(payment) => {
            setNotice(
              `Đã ghi nhận ${formatMoney(payment.amount)} (${PAYMENT_METHOD_LABELS[payment.paymentMethod]}) cho hóa đơn của ${paymentInvoice.childFullName}.`
            );
            setPaymentInvoice(null);
          }}
        />
      )}
    </div>
  );
}
