"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ApiErrorAlert, Button, ConfirmDialog, Modal, Textarea } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatMeasurementDateTime } from "@/lib/datetime";
import type { ComplaintResponse } from "@/types/complaint";
import { MAX_RESOLUTION_LENGTH, resolutionRules } from "../_lib/complaint-rules";
import { useHandleComplaint } from "../_lib/complaints-api";

interface ResolveFormValues {
  resolution: string;
}

interface ResolveComplaintModalProps {
  complaint: ComplaintResponse;
  onClose: () => void;
  onSuccess: (complaint: ComplaintResponse) => void;
  // 404, 409: phản ánh không còn ghi kết quả được (Admin khác vừa xử lý xong). Đóng hộp thoại, trang báo
  // message của backend và danh sách đã được tải lại
  onStale: (message: string) => void;
}

// Hộp thoại "Ghi kết quả xử lý" (SCR-ADM-04 vùng 4, hành vi 2). Đi hai bước: nhập kết quả rồi xác nhận,
// vì phụ huynh gửi sẽ nhận thông báo và phản ánh đã xử lý không đổi được nữa (D39 mục 18)
export function ResolveComplaintModal({ complaint, onClose, onSuccess, onStale }: ResolveComplaintModalProps) {
  const handleComplaint = useHandleComplaint();
  const isPending = handleComplaint.isPending;
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResolveFormValues>({ defaultValues: { resolution: "" } });
  const resolution = useWatch({ control, name: "resolution" });
  const trimmedLength = resolution.trim().length;

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const submit = () =>
    handleComplaint.mutate(
      { id: complaint.id, body: { status: "Resolved", resolution: resolution.trim() } },
      {
        onSuccess,
        onError: (error) => {
          const apiError = toApiError(error);
          if (apiError.status === 404 || apiError.status === 409) {
            onStale(apiError.message);
            return;
          }
          // 400 và lỗi khác: quay về bước nhập, liệt kê lỗi ở đó để sửa và gửi lại
          setIsConfirming(false);
        },
      }
    );

  if (isConfirming) {
    return (
      <ConfirmDialog
        isOpen
        onClose={() => setIsConfirming(false)}
        onConfirm={submit}
        isLoading={isPending}
        variant="primary"
        title="Đánh dấu đã xử lý?"
        confirmText="Đánh dấu đã xử lý"
        cancelText="Quay lại"
        message={
          <p>
            <strong className="text-on-surface break-words">{complaint.submittedByFullName}</strong> sẽ nhận
            thông báo. Phản ánh đã xử lý không đổi được nữa.
          </p>
        }
      />
    );
  }

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="lg"
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      title="Ghi kết quả xử lý"
      description={`Phản ánh về ${complaint.childFullName}, gửi lúc ${formatMeasurementDateTime(complaint.createdAtUtc)}`}
    >
      <form
        onSubmit={handleSubmit(() => {
          handleComplaint.reset();
          setIsConfirming(true);
        })}
        noValidate
        className="space-y-4"
      >
        <ApiErrorAlert error={handleComplaint.error} />

        <div className="space-y-1">
          {/* Đếm sau khi bỏ khoảng trắng hai đầu, cùng cách đo với backend. Không đặt maxLength trên ô để
              dán đoạn dài không bị cắt ngầm; quá giới hạn thì báo lỗi */}
          <Textarea
            label="Kết quả"
            required
            rows={6}
            disabled={isPending}
            error={errors.resolution?.message}
            helperText="Phụ huynh đọc được nguyên văn kết quả này."
            {...register("resolution", resolutionRules)}
          />
          <p
            className={`text-right text-xs font-medium ${
              trimmedLength > MAX_RESOLUTION_LENGTH ? "text-error font-bold" : "text-outline"
            }`}
            aria-live="polite"
          >
            {trimmedLength}/{MAX_RESOLUTION_LENGTH}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="min-h-11 sm:min-h-0">
            Hủy
          </Button>
          <Button type="submit" disabled={isPending} className="min-h-11 sm:min-h-0">
            Đánh dấu đã xử lý
          </Button>
        </div>
      </form>
    </Modal>
  );
}
