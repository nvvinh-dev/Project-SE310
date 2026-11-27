"use client";

import { useForm, useWatch } from "react-hook-form";
import { ApiErrorAlert, Button, Modal, Textarea } from "@/components";
import type { AbsenceFollowUpOutcome } from "@/types/absence";
import { NOTE_MAX_LENGTH } from "../_lib/absence-rules";

interface FollowUpFormValues {
  note: string;
}

interface FollowUpModalProps {
  childFullName: string;
  outcome: AbsenceFollowUpOutcome;
  isSubmitting: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (note: string | null) => void;
}

// SCR-TCH-07 vùng 2: ghi kết quả một lần gọi. "Đã liên lạc được" bắt buộc ghi chú; "Không liên lạc được"
// ghi chú tùy chọn và báo trước Ban giám hiệu sẽ nhận thông báo (Hành vi 2). Trang chỉ mount hộp thoại khi
// mở, nên mỗi lần mở là một form mới
export function FollowUpModal({ childFullName, outcome, isSubmitting, error, onClose, onSubmit }: FollowUpModalProps) {
  const isReached = outcome === "Reached";
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FollowUpFormValues>({ defaultValues: { note: "" } });
  const watchedNote = useWatch({ control, name: "note" }) ?? "";

  const submit = handleSubmit((values) => {
    const note = values.note.trim();
    onSubmit(note === "" ? null : note);
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      closeOnBackdropClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      showCloseButton={!isSubmitting}
      title={isReached ? "Đã liên lạc được" : "Không liên lạc được"}
      description={childFullName}
    >
      <form onSubmit={(e) => void submit(e)} className="space-y-4" noValidate>
        {!isReached && (
          <p className="rounded-2xl bg-amber-100 p-3 text-sm font-medium text-amber-800">
            Ban giám hiệu sẽ nhận thông báo.
          </p>
        )}

        <Textarea
          id="absence-follow-up-note"
          label="Ghi chú"
          required={isReached}
          rows={4}
          maxLength={NOTE_MAX_LENGTH}
          showCount
          currentValue={watchedNote}
          placeholder={isReached ? "Ví dụ: Mẹ báo trẻ bị sốt, nghỉ ở nhà" : "Ví dụ: Gọi cả hai số đều không nghe máy"}
          helperText={isReached ? "Ghi lại nội dung trao đổi, ví dụ lý do trẻ vắng" : "Không bắt buộc"}
          error={errors.note?.message}
          disabled={isSubmitting}
          {...register("note", {
            validate: (value) => {
              const trimmed = value.trim();
              if (isReached && trimmed === "") return "Liên lạc được thì phải ghi chú nội dung trao đổi.";
              if (trimmed.length > NOTE_MAX_LENGTH) return `Ghi chú tối đa ${NOTE_MAX_LENGTH} ký tự.`;
              return true;
            },
          })}
        />

        <ApiErrorAlert error={error} />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 min-h-11 sm:min-h-0"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant={isReached ? "primary" : "danger"}
            isLoading={isSubmitting}
            className="flex-1 min-h-11 sm:min-h-0"
          >
            Ghi kết quả
          </Button>
        </div>
      </form>
    </Modal>
  );
}
