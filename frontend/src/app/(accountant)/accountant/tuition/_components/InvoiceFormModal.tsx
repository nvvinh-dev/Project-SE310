"use client";

import { useForm, useWatch } from "react-hook-form";
import {
  ApiErrorAlert,
  Button,
  EmptyState,
  ErrorAlert,
  Input,
  LoadingSpinner,
  Modal,
  Select,
  Textarea,
} from "@/components";
import { toApiError } from "@/lib/axios";
import { formatMoney } from "@/lib/format";
import type { InvoiceResponse, TuitionFeeResponse } from "@/types/tuition";
import { useChildren } from "../../students/_lib/children-api";
import { useCreateInvoice, useUpdateInvoice } from "../_lib/tuition-api";
import {
  amountRules,
  invoiceChildRules,
  invoiceDescriptionRules,
  MAX_INVOICE_DESCRIPTION_LENGTH,
  toInvoiceRequest,
  type InvoiceFormValues,
} from "../_lib/tuition-rules";

// Lập mới thì điền sẵn từ biểu phí; sửa thì nạp hóa đơn đang sửa (chỉ hóa đơn "Chưa thanh toán")
export type InvoiceFormTarget = { mode: "create"; fee: TuitionFeeResponse } | { mode: "edit"; invoice: InvoiceResponse };

interface InvoiceFormModalProps {
  target: InvoiceFormTarget;
  onClose: () => void;
  onSuccess: (invoice: InvoiceResponse, isCreate: boolean) => void;
}

function toDefaultValues(target: InvoiceFormTarget): InvoiceFormValues {
  if (target.mode === "create") {
    return { childId: "", description: target.fee.description, amount: String(target.fee.amount) };
  }
  const { invoice } = target;
  return { childId: invoice.childId, description: invoice.description, amount: String(invoice.amount) };
}

// FR-TUITION-02 (SCR-ACC-02, Hành vi 2, 3). Không có ô trạng thái: hóa đơn mới luôn "Chưa thanh toán"
// (BR-TUITION-09). Kế toán sửa mô tả để ghi kỳ thu (D39 mục 4)
export function InvoiceFormModal({ target, onClose, onSuccess }: InvoiceFormModalProps) {
  const isCreate = target.mode === "create";
  const childrenQuery = useChildren();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const mutation = isCreate ? createInvoice : updateInvoice;
  const isPending = mutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<InvoiceFormValues>({ defaultValues: toDefaultValues(target) });

  const description = useWatch({ control, name: "description" });
  const amount = useWatch({ control, name: "amount" });
  const amountPreview = Number(amount) > 0 ? `Tương ứng ${formatMoney(Number(amount))}` : undefined;

  const children = childrenQuery.data;

  function onSubmit(values: InvoiceFormValues) {
    const body = toInvoiceRequest(values);
    const handleSuccess = (saved: InvoiceResponse) => onSuccess(saved, isCreate);
    if (target.mode === "edit") updateInvoice.mutate({ id: target.invoice.id, body }, { onSuccess: handleSuccess });
    else createInvoice.mutate(body, { onSuccess: handleSuccess });
  }

  const handleClose = () => {
    if (!isPending) onClose();
  };

  // Lỗi khi chưa có dữ liệu thì thay cả form; lỗi lúc tải lại thì giữ danh sách cũ và báo ở trên
  const loadError = childrenQuery.isError ? toApiError(childrenQuery.error).message : null;
  const retryChildren = () => void childrenQuery.refetch();

  const closeButton = (
    <Button variant="outline" onClick={handleClose} className="w-full min-h-11 sm:min-h-0">
      Đóng
    </Button>
  );

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="lg"
      title={isCreate ? "Lập hóa đơn" : "Sửa hóa đơn"}
      description={
        isCreate
          ? "Số tiền và mô tả lấy sẵn từ biểu phí; sửa mô tả để ghi kỳ thu, ví dụ “Học phí tháng 10/2026”. Lưu xong, phụ huynh của trẻ nhận thông báo."
          : "Chỉ sửa được hóa đơn chưa thanh toán. Đổi sang trẻ khác thì phụ huynh của trẻ cũ nhận thông báo không cần thanh toán hóa đơn này."
      }
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
    >
      <div className="space-y-4">
        {/* Đặt ngoài form: lỗi vẫn đọc được cả khi danh sách trẻ tải lại thành rỗng */}
        <ApiErrorAlert error={mutation.error} />

        {loadError && children !== undefined && (
          <ErrorAlert title="Không tải lại được danh sách trẻ" message={loadError} onRetry={retryChildren} />
        )}

        {childrenQuery.isPending ? (
          <LoadingSpinner label="Đang tải danh sách trẻ..." />
        ) : children === undefined ? (
          <>
            <ErrorAlert title="Không tải được danh sách trẻ" message={loadError ?? ""} onRetry={retryChildren} />
            {closeButton}
          </>
        ) : children.length === 0 ? (
          <>
            <EmptyState
              title="Chưa có hồ sơ trẻ"
              message="Lập hồ sơ trẻ ở mục “Hồ sơ trẻ và phụ huynh” trước khi lập hóa đơn."
            />
            {closeButton}
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <fieldset disabled={isPending} className="min-w-0 space-y-4">
              <Select
                label="Trẻ"
                required
                autoFocus
                placeholder="Chọn trẻ"
                options={children.map((child) => ({ value: child.id, label: child.fullName }))}
                error={errors.childId?.message}
                {...register("childId", invoiceChildRules)}
              />
              <Textarea
                label="Mô tả"
                required
                maxLength={MAX_INVOICE_DESCRIPTION_LENGTH}
                showCount
                currentValue={description}
                error={errors.description?.message}
                {...register("description", invoiceDescriptionRules)}
              />
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                label="Số tiền (đồng)"
                required
                error={errors.amount?.message}
                helperText={amountPreview}
                {...register("amount", amountRules)}
              />
            </fieldset>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 min-h-11 sm:min-h-0"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                isLoading={isPending}
                disabled={!isCreate && !isDirty}
                className="flex-1 min-h-11 sm:min-h-0"
              >
                Lưu
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
