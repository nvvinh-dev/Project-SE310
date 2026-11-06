"use client";

import { Button, ErrorAlert, LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatMoney } from "@/lib/format";
import type { TuitionFeeResponse } from "@/types/tuition";
import { useTuitionFee } from "../_lib/tuition-api";

interface TuitionFeeCardProps {
  // Gửi kèm biểu phí đang hiện: null là tạo, có giá trị là sửa
  onOpenFeeForm: (fee: TuitionFeeResponse | null) => void;
}

// Vùng 1 của SCR-ACC-02: một mức phí chung toàn trường. Chưa có thì chỉ có "Tạo biểu phí", đã có thì chỉ có
// "Sửa biểu phí"; không xóa biểu phí (D40 mục 1)
export function TuitionFeeCard({ onOpenFeeForm }: TuitionFeeCardProps) {
  const feeQuery = useTuitionFee();
  const fee = feeQuery.data;

  // null là chưa có biểu phí; undefined là chưa tải được lần nào
  const loadError = feeQuery.isError ? toApiError(feeQuery.error).message : null;
  const retryFee = () => void feeQuery.refetch();

  return (
    <section
      aria-labelledby="tuition-fee-heading"
      className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-6 shadow-sm space-y-3"
    >
      <h2 id="tuition-fee-heading" className="text-lg font-bold text-on-surface">
        Biểu phí chung
      </h2>

      {loadError && fee !== undefined && (
        <ErrorAlert title="Không tải lại được biểu phí" message={loadError} onRetry={retryFee} />
      )}

      {feeQuery.isPending ? (
        <LoadingSpinner label="Đang tải biểu phí..." />
      ) : fee === undefined ? (
        <ErrorAlert message={loadError ?? ""} onRetry={retryFee} />
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {fee ? (
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm text-on-surface-variant whitespace-pre-wrap break-words">{fee.description}</p>
              <p className="text-xl font-bold text-on-surface">{formatMoney(fee.amount)}</p>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">
              Chưa có biểu phí. Tạo biểu phí trước để lập hóa đơn: số tiền và mô tả của hóa đơn mới lấy từ biểu phí.
            </p>
          )}
          <Button
            variant={fee ? "outline" : "primary"}
            onClick={() => onOpenFeeForm(fee)}
            className="self-start sm:self-auto shrink-0 min-h-11 sm:min-h-0"
          >
            {fee ? "Sửa biểu phí" : "Tạo biểu phí"}
          </Button>
        </div>
      )}
    </section>
  );
}
