"use client";

import { useForm } from "react-hook-form";
import { Button, ConfirmDialog, EmptyState, ErrorAlert, LoadingSpinner, Modal, Select } from "@/components";
import { toApiError } from "@/lib/axios";
import type { ClassResponse } from "@/types/class";
import { ApiErrorAlert } from "../../users/_components/ApiErrorAlert";
import { useUsers } from "../../users/_lib/users-api";
import { useAssignHomeroomTeacher } from "../_lib/classes-api";
import { formatAgeRange, teacherUserIdRules } from "../_lib/class-rules";
import { MissingBadge } from "./ClassBadges";

interface HomeroomTeacherFormValues {
  teacherUserId: string;
}

interface HomeroomTeacherModalProps {
  cls: ClassResponse;
  onClose: () => void;
  onSuccess: (cls: ClassResponse) => void;
}

// Gán hoặc đổi giáo viên chủ nhiệm. Danh sách chọn lọc từ GET /api/users: tài khoản vai trò Giáo viên
// đang hoạt động. Danh sách này không cho biết ai đã có hồ sơ giáo viên (ui-screens.md §11 mục 5);
// chọn tài khoản chưa có hồ sơ thì hiện message 409 của backend
export function HomeroomTeacherModal({ cls, onClose, onSuccess }: HomeroomTeacherModalProps) {
  const usersQuery = useUsers();
  const assignTeacher = useAssignHomeroomTeacher();
  const isPending = assignTeacher.isPending;
  const currentTeacher = cls.homeroomTeacher;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HomeroomTeacherFormValues>({
    defaultValues: { teacherUserId: "" },
    mode: "onTouched",
  });

  const teachers = (usersQuery.data ?? []).filter((user) => user.role === "Teacher" && user.isActive);

  // Giáo viên chủ nhiệm hiện tại bị khóa trong danh sách: chọn lại đúng người đó backend trả 409.
  // Kèm email để phân biệt hai giáo viên trùng họ tên
  const teacherOptions = teachers.map((teacher) => {
    const isCurrent = currentTeacher?.userId.toLowerCase() === teacher.id.toLowerCase();
    return {
      value: teacher.id,
      label: `${teacher.fullName} · ${teacher.email}${isCurrent ? " (hiện tại)" : ""}`,
      disabled: isCurrent,
    };
  });

  function onSubmit(values: HomeroomTeacherFormValues) {
    assignTeacher.mutate({ classId: cls.id, body: { teacherUserId: values.teacherUserId } }, { onSuccess });
  }

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const retryUsers = () => void usersQuery.refetch();

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="lg"
      title={currentTeacher ? "Đổi giáo viên chủ nhiệm" : "Gán giáo viên chủ nhiệm"}
      description="Chọn một tài khoản Giáo viên đang hoạt động."
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
    >
      {usersQuery.isPending ? (
        <LoadingSpinner label="Đang tải danh sách giáo viên..." />
      ) : !usersQuery.data ? (
        <ErrorAlert
          title="Không tải được danh sách giáo viên"
          message={toApiError(usersQuery.error).message}
          onRetry={retryUsers}
        />
      ) : teachers.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title="Chưa có giáo viên để chọn"
            message="Chưa có tài khoản Giáo viên nào đang hoạt động. Tạo tài khoản ở mục Tài khoản và vai trò, rồi nhờ Kế toán lập hồ sơ giáo viên."
          />
          <Button variant="outline" onClick={onClose} className="w-full">
            Đóng
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <ApiErrorAlert error={assignTeacher.error} />

          {usersQuery.isError && (
            <ErrorAlert
              title="Không tải lại được danh sách giáo viên"
              message={toApiError(usersQuery.error).message}
              onRetry={retryUsers}
            />
          )}

          <ClassSummary cls={cls} />

          <fieldset disabled={isPending} className="min-w-0">
            <Select
              label={currentTeacher ? "Giáo viên chủ nhiệm mới" : "Giáo viên chủ nhiệm"}
              required
              autoFocus
              placeholder="Chọn giáo viên"
              options={teacherOptions}
              helperText="Giáo viên phải có hồ sơ do Kế toán lập trước khi được phân công lớp."
              error={errors.teacherUserId?.message}
              {...register("teacherUserId", teacherUserIdRules)}
            />
          </fieldset>

          {/* Gán giáo viên chủ nhiệm quyết định giáo viên đó thấy những trẻ nào (AUTH-RULE-06) */}
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {currentTeacher
              ? `Sau khi lưu, giáo viên mới thấy và thao tác được trên trẻ của lớp ${cls.name} ngay; ${currentTeacher.fullName} không còn thấy trẻ của lớp này.`
              : `Sau khi lưu, giáo viên được chọn thấy và thao tác được trên trẻ của lớp ${cls.name} ngay ở các màn hình điểm danh, sức khỏe và đón về.`}
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

function ClassSummary({ cls }: { cls: ClassResponse }) {
  const ageRange = formatAgeRange(cls);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-4 space-y-2">
      <p className="font-semibold text-on-surface">
        Lớp {cls.name}
        {ageRange && <span className="font-normal text-on-surface-variant"> · {ageRange}</span>}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
        <span>Giáo viên chủ nhiệm hiện tại:</span>
        {cls.homeroomTeacher ? (
          <span className="font-semibold text-on-surface break-words">{cls.homeroomTeacher.fullName}</span>
        ) : (
          <MissingBadge label="Chưa có" />
        )}
      </div>
    </div>
  );
}

interface RemoveHomeroomTeacherDialogProps {
  cls: ClassResponse;
  onClose: () => void;
  onSuccess: (cls: ClassResponse) => void;
}

// Bỏ giáo viên chủ nhiệm: gửi teacherUserId = null. Lớp chưa có giáo viên chủ nhiệm thì backend trả 409
export function RemoveHomeroomTeacherDialog({ cls, onClose, onSuccess }: RemoveHomeroomTeacherDialogProps) {
  const assignTeacher = useAssignHomeroomTeacher();
  const teacherName = cls.homeroomTeacher?.fullName ?? "giáo viên chủ nhiệm hiện tại";

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      onConfirm={() => assignTeacher.mutate({ classId: cls.id, body: { teacherUserId: null } }, { onSuccess })}
      isLoading={assignTeacher.isPending}
      variant="warning"
      title="Bỏ giáo viên chủ nhiệm"
      confirmText="Bỏ GVCN"
      message={
        <div className="space-y-3">
          <p>
            Bỏ <strong className="text-on-surface break-words">{teacherName}</strong> khỏi vai trò giáo viên chủ
            nhiệm lớp <strong className="text-on-surface">{cls.name}</strong>?
          </p>
          <p className="text-xs">
            Giáo viên này không còn thấy trẻ của lớp {cls.name} ngay ở lần thao tác kế tiếp. Đến khi gán giáo viên
            chủ nhiệm mới, trẻ của lớp không hiện ở màn hình của giáo viên nào.
          </p>
          <ApiErrorAlert error={assignTeacher.error} />
        </div>
      }
    />
  );
}
