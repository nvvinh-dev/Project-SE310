"use client";

import { useForm, useWatch } from "react-hook-form";
import { ApiErrorAlert, Button, Input, Modal } from "@/components";
import { getTodayVietnamDateString } from "@/lib/datetime";
import type { ChildResponse } from "@/types/child";
import { useCreateChild, useUpdateChild } from "../_lib/children-api";
import {
  type ChildFormValues,
  childFullNameRules,
  dateOfBirthRules,
  enrollmentDateRules,
} from "../_lib/child-rules";

interface ChildFormModalProps {
  // Không truyền child là thêm hồ sơ mới, có child là sửa hồ sơ đó
  child?: ChildResponse;
  onClose: () => void;
  onSuccess: (child: ChildResponse) => void;
}

// Kế toán chỉ nhập họ tên, ngày sinh, ngày nhập học. Không có ô lưu ý sức khỏe (của Y tế), ô lớp (của
// Admin) hay ô trạng thái (D39 mục 2, D45). Không có thao tác xóa hồ sơ (D40 mục 1)
export function ChildFormModal({ child, onClose, onSuccess }: ChildFormModalProps) {
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const isEdit = child !== undefined;
  const mutation = isEdit ? updateChild : createChild;
  const isPending = mutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<ChildFormValues>({
    defaultValues: {
      fullName: child?.fullName ?? "",
      dateOfBirth: child?.dateOfBirth ?? "",
      enrollmentDate: child?.enrollmentDate ?? "",
    },
    mode: "onTouched",
  });

  // Ô ngày nhập học giới hạn theo ngày sinh đang chọn; backend vẫn kiểm lại
  const dateOfBirth = useWatch({ control, name: "dateOfBirth" });

  function onSubmit(values: ChildFormValues) {
    const body = {
      fullName: values.fullName.trim(),
      dateOfBirth: values.dateOfBirth,
      enrollmentDate: values.enrollmentDate,
    };

    if (child) {
      updateChild.mutate({ id: child.id, body }, { onSuccess });
    } else {
      createChild.mutate(body, { onSuccess });
    }
  }

  const handleClose = () => {
    if (!isPending) onClose();
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="lg"
      title={isEdit ? "Sửa hồ sơ trẻ" : "Thêm hồ sơ trẻ"}
      description="Lớp do Quản trị viên xếp, lưu ý sức khỏe do Nhân viên Y tế ghi, nên không nhập ở đây."
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <ApiErrorAlert error={mutation.error} />

        <fieldset disabled={isPending} className="min-w-0 space-y-4">
          <Input
            label="Họ tên trẻ"
            required
            autoFocus
            autoComplete="off"
            placeholder="Nguyễn Văn A"
            error={errors.fullName?.message}
            {...register("fullName", childFullNameRules)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Ngày sinh"
              required
              type="date"
              max={getTodayVietnamDateString()}
              error={errors.dateOfBirth?.message}
              {...register("dateOfBirth", dateOfBirthRules)}
            />

            <Input
              label="Ngày nhập học"
              required
              type="date"
              min={dateOfBirth || undefined}
              helperText="Không trước ngày sinh."
              error={errors.enrollmentDate?.message}
              {...register("enrollmentDate", enrollmentDateRules)}
            />
          </div>
        </fieldset>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="flex-1">
            Hủy
          </Button>
          <Button type="submit" isLoading={isPending} disabled={isEdit && !isDirty} className="flex-1">
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
}
