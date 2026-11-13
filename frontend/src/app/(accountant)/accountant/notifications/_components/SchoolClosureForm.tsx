"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ApiErrorAlert, Button, ConfirmDialog, Textarea } from "@/components";
import { useBroadcastSchoolClosure } from "../_lib/school-closures-api";
import {
  contentRules,
  MAX_SCHOOL_CLOSURE_LENGTH,
  previewMessage,
  SCHOOL_CLOSURE_PREFIX,
  toSchoolClosureRequest,
  type SchoolClosureFormValues,
} from "../_lib/school-closure-rules";

interface SchoolClosureFormProps {
  // Trước khi gửi, trang ẩn dải thông báo cũ
  onStart: () => void;
  onSuccess: (recipientCount: number) => void;
}

// SCR-ACC-07: nhập nội dung, xem trước câu phụ huynh nhận, rồi xác nhận lại vì thông báo không sửa và không thu hồi
// được (ui-screens.md §4.3). Gửi thành công mới xóa ô nội dung
export function SchoolClosureForm({ onStart, onSuccess }: SchoolClosureFormProps) {
  const broadcast = useBroadcastSchoolClosure();
  // Nội dung đã qua kiểm tra, đang chờ xác nhận; null là chưa mở hộp thoại
  const [pendingContent, setPendingContent] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SchoolClosureFormValues>({ defaultValues: { content: "" } });

  const content = useWatch({ control, name: "content" });
  const hasContent = content.trim().length > 0;

  const openConfirm = handleSubmit((values) => {
    onStart();
    broadcast.reset();
    setPendingContent(toSchoolClosureRequest(values).content);
  });

  const closeConfirm = () => {
    if (broadcast.isPending) return;
    setPendingContent(null);
  };

  const send = () => {
    if (pendingContent === null) return;
    broadcast.mutate(
      { content: pendingContent },
      {
        onSuccess: (result) => {
          setPendingContent(null);
          reset({ content: "" });
          onSuccess(result.recipientCount);
        },
      }
    );
  };

  return (
    <>
      <form
        onSubmit={openConfirm}
        noValidate
        className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-6 shadow-sm space-y-4"
      >
        <Textarea
          label="Nội dung"
          required
          rows={5}
          placeholder="Ví dụ: Thứ Hai 01/12 trường nghỉ học do mất điện. Phụ huynh vui lòng sắp xếp đón trẻ."
          maxLength={MAX_SCHOOL_CLOSURE_LENGTH}
          showCount
          currentValue={content}
          helperText="Ghi rõ ngày nghỉ và lý do."
          error={errors.content?.message}
          {...register("content", contentRules)}
        />

        {/* Vùng 2: chỉ để xem trước, backend mới là nơi ghép tiền tố */}
        <div className="rounded-2xl border border-slate-200/90 bg-surface-container-low/60 p-4 space-y-1">
          <p className="text-xs font-semibold text-on-surface-variant">Phụ huynh sẽ nhận</p>
          <p className="text-sm text-on-surface whitespace-pre-wrap wrap-anywhere">
            {hasContent ? (
              previewMessage(content)
            ) : (
              <>
                {SCHOOL_CLOSURE_PREFIX}
                <span className="text-on-surface-variant italic">nội dung bạn nhập</span>
              </>
            )}
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto min-h-11 sm:min-h-0">
            Gửi tới mọi phụ huynh
          </Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={pendingContent !== null}
        onClose={closeConfirm}
        onConfirm={send}
        isLoading={broadcast.isPending}
        variant="warning"
        title="Gửi thông báo nghỉ học?"
        confirmText="Gửi"
        message={
          <div className="w-full min-w-0 space-y-3 text-left">
            <p>Thông báo gửi tới mọi phụ huynh đang hoạt động; thông báo không sửa và không thu hồi được.</p>
            <p className="rounded-2xl border border-slate-200/90 bg-surface-container-low/60 p-4 text-on-surface whitespace-pre-wrap wrap-anywhere">
              {pendingContent !== null && previewMessage(pendingContent)}
            </p>
            <ApiErrorAlert error={broadcast.error} />
          </div>
        }
      />
    </>
  );
}
