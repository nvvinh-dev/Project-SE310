"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Checkbox, ConfirmDialog, EmptyState, ErrorAlert, Input, LoadingSpinner, Modal } from "@/components";
import { toApiError } from "@/lib/axios";
import { normalizeForSearch } from "@/lib/text";
import type { ClassResponse } from "@/types/class";
import { ApiErrorAlert } from "../../users/_components/ApiErrorAlert";
import { useUsers } from "../../users/_lib/users-api";
import { useAssignAssistantTeachers, useClasses } from "../_lib/classes-api";

interface AssistantTeachersFormValues {
  search: string;
  // Id tài khoản viết thường của các giáo viên đang được đánh dấu
  teacherUserIds: string[];
}

interface TeacherOption {
  id: string;
  fullName: string;
  description: string;
  isHomeroom: boolean;
}

interface AssistantTeachersModalProps {
  cls: ClassResponse;
  onClose: () => void;
  onSuccess: (cls: ClassResponse) => void;
}

// Backend trả Guid viết thường, nhưng so sánh vẫn không phân biệt hoa thường như hộp thoại GVCN
const toKey = (id: string) => id.toLowerCase();

// Sửa giáo viên phụ của một lớp (FR-CLASS-02, SCR-ADM-03 vùng 3). Danh sách chọn lọc từ GET /api/users:
// tài khoản vai trò Giáo viên đang hoạt động. Danh sách này không cho biết ai đã có hồ sơ giáo viên
// (ui-screens.md §11 mục 4); chọn tài khoản chưa có hồ sơ thì hiện message 409 của backend
export function AssistantTeachersModal({ cls: openedClass, onClose, onSuccess }: AssistantTeachersModalProps) {
  const usersQuery = useUsers();
  const classesQuery = useClasses();
  const assignAssistants = useAssignAssistantTeachers();
  const isPending = assignAssistants.isPending;
  const [isConfirming, setIsConfirming] = useState(false);

  // Sau 409 danh sách lớp được tải lại: đọc lớp mới nhất để khóa đúng giáo viên chủ nhiệm vừa đổi
  const cls = classesQuery.data?.find((item) => item.id === openedClass.id) ?? openedClass;
  const homeroomKey = cls.homeroomTeacher ? toKey(cls.homeroomTeacher.userId) : null;
  const currentKeys = cls.assistantTeachers.map((assistant) => toKey(assistant.userId));

  const { register, control, handleSubmit, setValue } = useForm<AssistantTeachersFormValues>({
    defaultValues: {
      search: "",
      teacherUserIds: openedClass.assistantTeachers.map((assistant) => toKey(assistant.userId)),
    },
  });
  const [search, checkedKeys] = useWatch({ control, name: ["search", "teacherUserIds"] });

  // Người vừa được Admin khác gán làm giáo viên chủ nhiệm của lớp thì không gửi đi nữa (BR-CLASS-04)
  const selectedKeys = checkedKeys.filter((key) => key !== homeroomKey);

  const activeTeachers = (usersQuery.data ?? []).filter((user) => user.role === "Teacher" && user.isActive);
  const activeKeys = new Set(activeTeachers.map((teacher) => toKey(teacher.id)));

  // Kèm email để phân biệt hai giáo viên trùng họ tên. Giáo viên phụ hiện tại mà tài khoản không còn là
  // Giáo viên đang hoạt động vẫn hiện ở cuối để Admin gỡ được; để nguyên thì backend trả 409
  const options: TeacherOption[] = [
    ...activeTeachers.map((teacher) => {
      const isHomeroom = toKey(teacher.id) === homeroomKey;
      return {
        id: toKey(teacher.id),
        fullName: teacher.fullName,
        description: isHomeroom ? `${teacher.email} · giáo viên chủ nhiệm của lớp này` : teacher.email,
        isHomeroom,
      };
    }),
    ...cls.assistantTeachers
      .filter((assistant) => !activeKeys.has(toKey(assistant.userId)))
      .map((assistant) => ({
        id: toKey(assistant.userId),
        fullName: assistant.fullName,
        description: "Tài khoản không còn là Giáo viên đang hoạt động. Bỏ đánh dấu để lưu được.",
        isHomeroom: false,
      })),
  ];

  const keyword = normalizeForSearch(search);
  const visibleOptions = options.filter(
    (option) => keyword === "" || normalizeForSearch(option.fullName).includes(keyword)
  );

  const nameOf = (key: string) =>
    options.find((option) => option.id === key)?.fullName ??
    cls.assistantTeachers.find((assistant) => toKey(assistant.userId) === key)?.fullName ??
    "Giáo viên";

  const addedNames = selectedKeys.filter((key) => !currentKeys.includes(key)).map(nameOf);
  const removedNames = currentKeys.filter((key) => !selectedKeys.includes(key)).map(nameOf);
  const hasChanges = addedNames.length > 0 || removedNames.length > 0;

  const toggle = (key: string) =>
    setValue(
      "teacherUserIds",
      checkedKeys.includes(key) ? checkedKeys.filter((item) => item !== key) : [...checkedKeys, key]
    );

  const handleClose = () => {
    if (!isPending) onClose();
  };

  // Quay lại bước chọn thì bỏ lỗi của lần lưu trước
  const backToSelection = () => {
    assignAssistants.reset();
    setIsConfirming(false);
  };

  const retryUsers = () => void usersQuery.refetch();

  if (isConfirming) {
    return (
      <ConfirmDialog
        isOpen
        onClose={backToSelection}
        onConfirm={() =>
          assignAssistants.mutate({ classId: cls.id, body: { teacherUserIds: selectedKeys } }, { onSuccess })
        }
        isLoading={isPending}
        variant={removedNames.length > 0 ? "warning" : "primary"}
        title={`Cập nhật giáo viên phụ lớp ${cls.name}`}
        confirmText="Lưu"
        cancelText="Quay lại"
        message={
          <div className="space-y-3">
            {addedNames.length > 0 && (
              <p>
                Thêm: <strong className="text-on-surface break-words">{addedNames.join(", ")}</strong>
              </p>
            )}
            {removedNames.length > 0 && (
              <p>
                Gỡ: <strong className="text-on-surface break-words">{removedNames.join(", ")}</strong>
              </p>
            )}
            {/* Thêm hay gỡ giáo viên phụ quyết định giáo viên đó thấy những trẻ nào (AUTH-RULE-06) */}
            <p className="text-xs">
              {addedNames.length > 0 &&
                `Người được thêm thấy và thao tác được với trẻ lớp ${cls.name} như giáo viên chủ nhiệm. `}
              {removedNames.length > 0 &&
                `Người bị gỡ không còn thấy trẻ lớp ${cls.name} ngay ở lần thao tác kế tiếp; bản ghi họ đã tạo vẫn giữ người ghi nhận.`}
            </p>
            <ApiErrorAlert error={assignAssistants.error} />
          </div>
        }
      />
    );
  }

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="lg"
      title={`Giáo viên phụ lớp ${cls.name}`}
      description="Đánh dấu các tài khoản Giáo viên đang hoạt động làm giáo viên phụ của lớp."
    >
      {usersQuery.isPending ? (
        <LoadingSpinner label="Đang tải danh sách giáo viên..." />
      ) : !usersQuery.data ? (
        <ErrorAlert
          title="Không tải được danh sách giáo viên"
          message={toApiError(usersQuery.error).message}
          onRetry={retryUsers}
        />
      ) : options.length === 0 ? (
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
        <form onSubmit={handleSubmit(() => setIsConfirming(true))} noValidate className="space-y-4">
          {usersQuery.isError && (
            <ErrorAlert
              title="Không tải lại được danh sách giáo viên"
              message={toApiError(usersQuery.error).message}
              onRetry={retryUsers}
            />
          )}

          <Input
            type="search"
            aria-label="Tìm theo họ tên"
            placeholder="Tìm theo họ tên"
            autoComplete="off"
            {...register("search")}
          />

          <fieldset className="min-w-0">
            <legend className="sr-only">Giáo viên phụ của lớp {cls.name}</legend>
            {visibleOptions.length === 0 ? (
              <p className="rounded-2xl border border-slate-200/90 p-4 text-center text-sm text-on-surface-variant">
                Không có giáo viên nào khớp với họ tên đang tìm.
              </p>
            ) : (
              <ul className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200/90 divide-y divide-slate-100">
                {visibleOptions.map((option) => (
                  <li key={option.id} className="flex min-h-11 items-center px-4 py-2 break-words">
                    {/* Giáo viên chủ nhiệm của chính lớp này có trong danh sách nhưng không chọn được */}
                    <Checkbox
                      label={option.fullName}
                      description={option.description}
                      checked={!option.isHomeroom && checkedKeys.includes(option.id)}
                      disabled={option.isHomeroom}
                      onChange={() => toggle(option.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Đang chọn {selectedKeys.length} giáo viên phụ. Giáo viên phải có hồ sơ do Kế toán lập trước khi được
            phân công lớp. Một giáo viên làm giáo viên phụ của nhiều lớp được.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1 min-h-11 sm:min-h-0">
              Hủy
            </Button>
            <Button type="submit" disabled={!hasChanges} className="flex-1 min-h-11 sm:min-h-0">
              Lưu
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
