"use client";

import { useForm, useWatch } from "react-hook-form";
import { ApiErrorAlert, Button, Input, Modal, Textarea } from "@/components";
import { formatMoney } from "@/lib/format";
import type { TuitionFeeResponse } from "@/types/tuition";
import { useCreateTuitionFee, useUpdateTuitionFee } from "../_lib/tuition-api";
import {
  amountRules,
  feeDescriptionRules,
  MAX_FEE_DESCRIPTION_LENGTH,
  toTuitionFeeFormValues,
  toTuitionFeeRequest,
  type TuitionFeeFormValues,
} from "../_lib/tuition-rules";

interface TuitionFeeModalProps {
  // null là tạo biểu phí, có giá trị là sửa biểu phí đó
  fee: TuitionFeeResponse | null;
  onClose: () => void;
  onSuccess: (fee: TuitionFeeResponse, isCreate: boolean) => void;
}

// FR-TUITION-01: một mức phí chung gồm mô tả và số tiền. Tạo khi đã có → 409; sửa không làm đổi hóa đơn đã lập
// (SCR-ACC-02, Hành vi 1)
export function TuitionFeeModal({ fee, onClose, onSuccess }: TuitionFeeModalProps) {
  const isCreate = fee === null;
  const createFee = useCreateTuitionFee();
  const updateFee = useUpdateTuitionFee();
  const mutation = isCreate ? createFee : updateFee;
  const isPending = mutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<TuitionFeeFormValues>({ defaultValues: toTuitionFeeFormValues(fee) });

  const description = useWatch({ control, name: "description" });
  const amount = useWatch({ control, name: "amount" });
  const amountPreview = Number(amount) > 0 ? `Tương ứng ${formatMoney(Number(amount))}` : undefined;

  function onSubmit(values: TuitionFeeFormValues) {
    const body = toTuitionFeeRequest(values);
    const handleSuccess = (saved: TuitionFeeResponse) => onSuccess(saved, isCreate);
    if (fee) updateFee.mutate({ id: fee.id, body }, { onSuccess: handleSuccess });
    else createFee.mutate(body, { onSuccess: handleSuccess });
  }

  const handleClose = () => {
    if (!isPending) onClose();
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="md"
      title={isCreate ? "Tạo biểu phí" : "Sửa biểu phí"}
      description={
        isCreate
          ? "Biểu phí là mức thu chung toàn trường. Hóa đơn mới lấy sẵn số tiền và mô tả từ đây."
          : "Sửa biểu phí không làm đổi hóa đơn đã lập; chỉ hóa đơn lập sau đó lấy mức mới."
      }
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <ApiErrorAlert error={mutation.error} />

        <fieldset disabled={isPending} className="min-w-0 space-y-4">
          <Textarea
            label="Mô tả"
            required
            autoFocus
            placeholder="Ví dụ: Học phí tháng"
            maxLength={MAX_FEE_DESCRIPTION_LENGTH}
            showCount
            currentValue={description}
            error={errors.description?.message}
            {...register("description", feeDescriptionRules)}
          />
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            label="Số tiền (đồng)"
            required
            placeholder="Ví dụ: 1500000"
            error={errors.amount?.message}
            helperText={amountPreview}
            {...register("amount", amountRules)}
          />
        </fieldset>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="flex-1 min-h-11 sm:min-h-0">
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
    </Modal>
  );
}
