"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ApiErrorAlert, Button, ConfirmDialog, Textarea } from "@/components";
import { toApiError } from "@/lib/axios";
import type { MyChildResponse } from "@/types/child";
import { complaintContentRules, MAX_COMPLAINT_CONTENT_LENGTH } from "../_lib/complaint-content-rules";
import { useCreateComplaint } from "../_lib/parent-complaints-api";

interface ComplaintFormValues {
  content: string;
}

interface ComplaintSubmitFormProps {
  child: MyChildResponse;
  onSuccess: () => void;
  // Gửi lỗi: trang tải lại danh sách con, con vừa bị gỡ liên kết thì chuyển con và giữ message (ui-screens.md §10)
  onSubmitError: (childId: string, message: string) => void;
}

// SCR-PAR-09 vùng 2 — Gửi phản ánh tới Ban giám hiệu (FR-COMPLAINT-01, AC-COMPLAINT-01, AC-COMPLAINT-02).
// Đi hai bước: nhập rồi xác nhận, vì phản ánh đã gửi không sửa, không xóa được (D39 mục 18).
// Trang đặt key theo con nên đổi con thì form khởi tạo lại, không gửi nhầm nội dung sang con khác
export function ComplaintSubmitForm({ child, onSuccess, onSubmitError }: ComplaintSubmitFormProps) {
  const createComplaint = useCreateComplaint();
  const isPending = createComplaint.isPending;
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormValues>({ defaultValues: { content: "" } });
  const content = useWatch({ control, name: "content" });
  const trimmedLength = content.trim().length;

  // Chỉ gửi { content }; trạng thái và người gửi do backend đặt (D44). Lỗi thì giữ nguyên chữ đã nhập
  // và báo message của backend ngay trên ô nhập (SCR-PAR-09 Hành vi 3)
  const submit = () =>
    createComplaint.mutate(
      { childId: child.id, body: { content: content.trim() } },
      {
        onSuccess: () => {
          setIsConfirming(false);
          reset({ content: "" });
          onSuccess();
        },
        onError: (error) => {
          setIsConfirming(false);
          onSubmitError(child.id, toApiError(error).message);
        },
      }
    );

  return (
    <section
      aria-labelledby="complaint-form-title"
      className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-6 shadow-sm space-y-4 min-w-0"
    >
      <div className="space-y-1 min-w-0">
        <h2 id="complaint-form-title" className="text-lg font-bold text-on-surface">
          Gửi phản ánh tới Ban giám hiệu
        </h2>
        <p className="text-sm text-on-surface-variant">
          Phản ánh gửi thẳng tới Ban giám hiệu, giáo viên không xem được.
        </p>
        <p className="text-sm text-on-surface-variant">Gửi xong không sửa hay xóa được.</p>
      </div>

      <form
        onSubmit={handleSubmit(() => {
          createComplaint.reset();
          setIsConfirming(true);
        })}
        noValidate
        className="space-y-4"
      >
        <ApiErrorAlert error={createComplaint.error} />

        <div className="space-y-1">
          {/* Đếm sau khi bỏ khoảng trắng hai đầu, cùng cách đo với backend. Không đặt maxLength trên ô để
              dán đoạn dài không bị cắt ngầm; quá giới hạn thì báo lỗi */}
          <Textarea
            label="Nội dung phản ánh"
            required
            rows={6}
            disabled={isPending}
            error={errors.content?.message}
            {...register("content", complaintContentRules)}
          />
          <p
            className={`text-right text-xs font-medium ${
              trimmedLength > MAX_COMPLAINT_CONTENT_LENGTH ? "text-error font-bold" : "text-on-surface-variant"
            }`}
          >
            {trimmedLength}/{MAX_COMPLAINT_CONTENT_LENGTH}
          </p>
          {/* Bộ đếm không đọc theo từng phím gõ; trình đọc màn hình chỉ được báo khi vượt giới hạn */}
          <p className="sr-only" aria-live="polite">
            {trimmedLength > MAX_COMPLAINT_CONTENT_LENGTH
              ? `Nội dung đang vượt quá ${MAX_COMPLAINT_CONTENT_LENGTH} ký tự`
              : ""}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end">
          <Button type="submit" isLoading={isPending} className="min-h-11 sm:min-h-0">
            Gửi phản ánh
          </Button>
        </div>
      </form>

      {isConfirming && (
        <ConfirmDialog
          isOpen
          onClose={() => setIsConfirming(false)}
          onConfirm={submit}
          isLoading={isPending}
          variant="primary"
          title="Gửi phản ánh?"
          confirmText="Gửi phản ánh"
          cancelText="Quay lại"
          message={
            <p className="break-words wrap-anywhere">
              Gửi phản ánh về <strong className="text-on-surface">{child.fullName}</strong> tới Ban giám
              hiệu? Phản ánh đã gửi không sửa và không xóa được.
            </p>
          }
        />
      )}
    </section>
  );
}
