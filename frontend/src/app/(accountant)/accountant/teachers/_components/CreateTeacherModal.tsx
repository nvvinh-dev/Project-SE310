"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ApiErrorAlert, Button, EmptyState, ErrorAlert, LoadingSpinner, Modal, Select } from "@/components";
import { toApiError } from "@/lib/axios";
import type { TeacherResponse } from "@/types/teacher";
import { useCreateTeacher, useTeacherAccounts } from "../_lib/teachers-api";
import { type CreateTeacherFormValues, teacherAccountRules } from "../_lib/teacher-rules";

interface CreateTeacherModalProps {
  onClose: () => void;
  onSuccess: (teacher: TeacherResponse) => void;
}

// Kế toán chỉ chọn tài khoản Giáo viên có sẵn rồi lập hồ sơ; không tạo hay sửa tài khoản, họ tên và email do
// Quản trị viên quản lý (D40 mục 1)
export function CreateTeacherModal({ onClose, onSuccess }: CreateTeacherModalProps) {
  const accountsQuery = useTeacherAccounts();
  const createTeacher = useCreateTeacher();
  const isPending = createTeacher.isPending;

  const {
    register,
    handleSubmit,
    control,
    resetField,
    formState: { errors },
  } = useForm<CreateTeacherFormValues>({ defaultValues: { userId: "" } });

  const accounts = accountsQuery.data;
  const selectedUserId = useWatch({ control, name: "userId" });

  // Sau 400 hay 409 danh sách được tải lại và tài khoản đang chọn rời khỏi đó. Bỏ chọn, để ô chọn không giữ
  // một id mà danh sách không còn hiện
  const isSelectionStale =
    selectedUserId !== "" && accounts !== undefined && !accounts.some((account) => account.userId === selectedUserId);
  useEffect(() => {
    if (isSelectionStale) resetField("userId");
  }, [isSelectionStale, resetField]);

  function onSubmit(values: CreateTeacherFormValues) {
    createTeacher.mutate({ userId: values.userId }, { onSuccess });
  }

  const handleClose = () => {
    if (!isPending) onClose();
  };

  // Lỗi khi chưa có dữ liệu thì thay cả ô chọn; lỗi lúc tải lại thì giữ danh sách cũ và báo ở trên
  const loadError = accountsQuery.isError ? toApiError(accountsQuery.error).message : null;
  const retryAccounts = () => void accountsQuery.refetch();

  const closeButton = (
    <Button variant="outline" onClick={handleClose} className="w-full min-h-11 sm:min-h-0">
      Đóng
    </Button>
  );

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="md"
      title="Lập hồ sơ giáo viên"
      description="Có hồ sơ thì Quản trị viên mới gán được tài khoản này làm giáo viên chủ nhiệm. Hồ sơ đã lập không sửa, không xóa được."
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
    >
      <div className="space-y-4">
        {/* Đặt ngoài form: 409 làm danh sách tải lại rỗng thì vẫn phải đọc được message */}
        <ApiErrorAlert error={createTeacher.error} />

        {loadError && accounts !== undefined && (
          <ErrorAlert title="Không tải lại được danh sách tài khoản" message={loadError} onRetry={retryAccounts} />
        )}

        {accountsQuery.isPending ? (
          <LoadingSpinner label="Đang tải danh sách tài khoản..." />
        ) : accounts === undefined ? (
          <>
            <ErrorAlert
              title="Không tải được danh sách tài khoản"
              message={loadError ?? ""}
              onRetry={retryAccounts}
            />
            {closeButton}
          </>
        ) : accounts.length === 0 ? (
          <>
            <EmptyState
              title="Không còn tài khoản để lập hồ sơ"
              message="Không còn tài khoản Giáo viên nào chưa có hồ sơ. Tài khoản mới do Quản trị viên tạo."
            />
            {closeButton}
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <fieldset disabled={isPending} className="min-w-0">
              <Select
                label="Tài khoản Giáo viên chưa có hồ sơ"
                required
                autoFocus
                placeholder="Chọn tài khoản"
                options={accounts.map((account) => ({
                  value: account.userId,
                  label: `${account.fullName} — ${account.email}`,
                }))}
                error={errors.userId?.message}
                {...register("userId", teacherAccountRules)}
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
              <Button type="submit" isLoading={isPending} className="flex-1 min-h-11 sm:min-h-0">
                Lập hồ sơ
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
