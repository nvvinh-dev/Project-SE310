"use client";

import { useForm } from "react-hook-form";
import { Button, ConfirmDialog, EmptyState, ErrorAlert, LoadingSpinner, Modal, Select } from "@/components";
import { toApiError } from "@/lib/axios";
import type { ClassPlacementResponse } from "@/types/class";
import { ApiErrorAlert } from "../../users/_components/ApiErrorAlert";
import { useAssignClass, useClasses } from "../_lib/classes-api";
import { classIdRules, formatAgeRange, formatDateOnly } from "../_lib/class-rules";
import { PlacementClassBadge } from "./ClassBadges";

interface AssignClassFormValues {
  classId: string;
}

interface AssignClassModalProps {
  placement: ClassPlacementResponse;
  onClose: () => void;
  onSuccess: (placement: ClassPlacementResponse) => void;
}

// Xếp trẻ chưa có lớp, hoặc chuyển trẻ sang lớp khác. Ô chọn hiện cả ba lớp kèm khoảng tuổi; tuổi do
// backend tính từ ngày sinh đã lưu, sai nhóm tuổi trả 400 và hiện nguyên message (BR-CLASS-03, AC-CLASS-03)
export function AssignClassModal({ placement, onClose, onSuccess }: AssignClassModalProps) {
  const classesQuery = useClasses();
  const assignClass = useAssignClass();
  const isPending = assignClass.isPending;
  const isMove = placement.classId !== null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignClassFormValues>({
    defaultValues: { classId: "" },
    mode: "onTouched",
  });

  // Lớp hiện tại bị khóa trong danh sách: chọn lại đúng lớp đó backend trả 409
  const classOptions = (classesQuery.data ?? []).map((cls) => {
    const ageRange = formatAgeRange(cls);
    const isCurrent = cls.id === placement.classId;
    return {
      value: cls.id,
      label: `${cls.name}${ageRange ? ` · ${ageRange}` : ""}${isCurrent ? " (hiện tại)" : ""}`,
      disabled: isCurrent,
    };
  });

  function onSubmit(values: AssignClassFormValues) {
    assignClass.mutate({ childId: placement.childId, body: { classId: values.classId } }, { onSuccess });
  }

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const retryClasses = () => void classesQuery.refetch();

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="lg"
      title={isMove ? "Chuyển lớp" : "Xếp lớp"}
      description="Chỉ xếp được vào lớp có khoảng tuổi chứa tuổi của trẻ."
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
    >
      {classesQuery.isPending ? (
        <LoadingSpinner label="Đang tải danh sách lớp..." />
      ) : !classesQuery.data ? (
        <ErrorAlert
          title="Không tải được danh sách lớp"
          message={toApiError(classesQuery.error).message}
          onRetry={retryClasses}
        />
      ) : classOptions.length === 0 ? (
        <div className="space-y-4">
          <EmptyState title="Chưa có lớp nào" message="Hệ thống chưa có lớp học nào để xếp trẻ vào." />
          <Button variant="outline" onClick={onClose} className="w-full">
            Đóng
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <ApiErrorAlert error={assignClass.error} />

          {classesQuery.isError && (
            <ErrorAlert
              title="Không tải lại được danh sách lớp"
              message={toApiError(classesQuery.error).message}
              onRetry={retryClasses}
            />
          )}

          <ChildSummary placement={placement} />

          <fieldset disabled={isPending} className="min-w-0">
            <Select
              label={isMove ? "Lớp mới" : "Lớp"}
              required
              autoFocus
              placeholder="Chọn lớp"
              options={classOptions}
              helperText="Tuổi tính theo số tháng tròn từ ngày sinh đã lưu trong hồ sơ trẻ."
              error={errors.classId?.message}
              {...register("classId", classIdRules)}
            />
          </fieldset>

          {/* Xếp, chuyển lớp làm trẻ hiện hoặc mất ngay ở màn hình của giáo viên (AUTH-RULE-06) */}
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isMove
              ? `Sau khi lưu, ${placement.fullName} mất khỏi màn hình của giáo viên chủ nhiệm lớp ${placement.className} và hiện ngay ở màn hình của giáo viên chủ nhiệm lớp mới.`
              : `Sau khi lưu, ${placement.fullName} hiện ngay ở màn hình của giáo viên chủ nhiệm lớp được chọn.`}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isPending} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" isLoading={isPending} className="flex-1">
              Lưu
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function ChildSummary({ placement }: { placement: ClassPlacementResponse }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-4 space-y-2">
      <div>
        <p className="font-semibold text-on-surface break-words">{placement.fullName}</p>
        <p className="text-xs text-on-surface-variant">Ngày sinh {formatDateOnly(placement.dateOfBirth)}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
        <span>Lớp hiện tại:</span>
        <PlacementClassBadge name={placement.className} />
      </div>
    </div>
  );
}

interface RemoveFromClassDialogProps {
  placement: ClassPlacementResponse;
  onClose: () => void;
  onSuccess: (placement: ClassPlacementResponse) => void;
}

// Gỡ trẻ khỏi lớp (trẻ nghỉ học, D39 mục 2): gửi classId = null. Hồ sơ trẻ không bị xóa
export function RemoveFromClassDialog({ placement, onClose, onSuccess }: RemoveFromClassDialogProps) {
  const assignClass = useAssignClass();

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      onConfirm={() => assignClass.mutate({ childId: placement.childId, body: { classId: null } }, { onSuccess })}
      isLoading={assignClass.isPending}
      variant="warning"
      title="Gỡ trẻ khỏi lớp"
      confirmText="Gỡ lớp"
      message={
        <div className="space-y-3">
          <p>
            Gỡ <strong className="text-on-surface break-words">{placement.fullName}</strong> khỏi lớp{" "}
            <strong className="text-on-surface">{placement.className}</strong>?
          </p>
          <p className="text-xs">
            Trẻ mất ngay khỏi màn hình của giáo viên chủ nhiệm lớp này. Hồ sơ trẻ vẫn giữ nguyên; bạn có thể xếp
            lại lớp sau.
          </p>
          <ApiErrorAlert error={assignClass.error} />
        </div>
      }
    />
  );
}
