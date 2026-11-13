"use client";

import { Button, EmptyState, ErrorAlert, LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import type { ClassResponse } from "@/types/class";
import { useClasses } from "../_lib/classes-api";
import { formatAgeRange } from "../_lib/class-rules";
import { MissingBadge } from "./ClassBadges";

interface ClassCardsProps {
  onAssignTeacher: (cls: ClassResponse) => void;
  onRemoveTeacher: (cls: ClassResponse) => void;
  onEditAssistants: (cls: ClassResponse) => void;
}

// Vùng 1: ba lớp cố định kèm giáo viên chủ nhiệm và giáo viên phụ. Không có nút tạo hay xóa lớp (D39 mục 3)
export function ClassCards({ onAssignTeacher, onRemoveTeacher, onEditAssistants }: ClassCardsProps) {
  const classesQuery = useClasses();
  const classes = classesQuery.data;
  const loadError = classesQuery.isError ? toApiError(classesQuery.error).message : null;
  const retry = () => void classesQuery.refetch();

  if (classesQuery.isPending) {
    return <LoadingSpinner label="Đang tải danh sách lớp..." />;
  }

  // Lỗi khi chưa có dữ liệu thì thay cả vùng; lỗi lúc tải lại thì giữ dữ liệu cũ và báo ở trên
  if (!classes) {
    return <ErrorAlert title="Không tải được danh sách lớp" message={loadError ?? ""} onRetry={retry} />;
  }

  return (
    <div className="space-y-3">
      {loadError && <ErrorAlert title="Không tải lại được danh sách lớp" message={loadError} onRetry={retry} />}

      {classes.length === 0 ? (
        <EmptyState title="Chưa có lớp nào" message="Hệ thống chưa có lớp học nào để phân công giáo viên." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-3">
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onAssignTeacher={onAssignTeacher}
              onRemoveTeacher={onRemoveTeacher}
              onEditAssistants={onEditAssistants}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ClassCard({
  cls,
  onAssignTeacher,
  onRemoveTeacher,
  onEditAssistants,
}: { cls: ClassResponse } & ClassCardsProps) {
  const ageRange = formatAgeRange(cls);
  const teacher = cls.homeroomTeacher;

  return (
    <li className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3">
      <div>
        <p className="text-base font-bold text-on-surface">{cls.name}</p>
        {ageRange && <p className="text-xs text-on-surface-variant">{ageRange}</p>}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-on-surface-variant">Giáo viên chủ nhiệm</p>
        {teacher ? (
          <p className="text-sm font-semibold text-on-surface break-words">{teacher.fullName}</p>
        ) : (
          <MissingBadge label="Chưa có" />
        )}
      </div>

      {/* Theo thứ tự backend trả (SCR-ADM-03 vùng 1) */}
      <div className="space-y-1">
        <p className="text-xs text-on-surface-variant">Giáo viên phụ</p>
        {cls.assistantTeachers.length > 0 ? (
          <ul className="space-y-0.5">
            {cls.assistantTeachers.map((assistant) => (
              <li key={assistant.userId} className="text-sm font-semibold text-on-surface break-words">
                {assistant.fullName}
              </li>
            ))}
          </ul>
        ) : (
          <MissingBadge label="Chưa có" />
        )}
      </div>

      {/* Chữ sr-only nêu tên lớp, vì ba thẻ có nút cùng chữ */}
      <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        {teacher ? (
          <>
            <Button size="sm" variant="outline" onClick={() => onAssignTeacher(cls)} className="min-h-11 sm:min-h-0">
              Đổi GVCN<span className="sr-only"> {cls.name}</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onRemoveTeacher(cls)} className="min-h-11 sm:min-h-0">
              Bỏ GVCN<span className="sr-only"> {cls.name}</span>
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => onAssignTeacher(cls)} className="min-h-11 sm:min-h-0">
            Gán GVCN<span className="sr-only"> {cls.name}</span>
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => onEditAssistants(cls)} className="min-h-11 sm:min-h-0">
          Sửa giáo viên phụ<span className="sr-only"> {cls.name}</span>
        </Button>
      </div>
    </li>
  );
}
