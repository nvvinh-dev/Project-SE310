"use client";

import React, { useMemo } from "react";
import { ErrorAlert } from "@/components";
import { toApiError } from "@/lib/axios";
import { useHomeroomChildren } from "../attendance/_lib/attendance-api";
import { ClassHealthNotesList } from "./_components/ClassHealthNotesList";

// SCR-TCH-05: cùng dữ liệu và cùng query với phần đánh dấu ở SCR-TCH-01 (FR-HEALTH-07)
export default function TeacherClassHealthNotesPage() {
  const childrenQuery = useHomeroomChildren();
  const childrenList = useMemo(() => childrenQuery.data ?? [], [childrenQuery.data]);
  const hasData = childrenQuery.data !== undefined;

  const errorMessage = childrenQuery.error ? toApiError(childrenQuery.error).message : null;

  const handleRetry = () => {
    void childrenQuery.refetch();
  };

  return (
    <div className="py-8 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Lưu ý sức khỏe của lớp
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Dị ứng và bệnh nền của trẻ trong lớp, để đọc trước giờ ăn và giờ hoạt động.
          </p>
        </div>
      </div>

      {/* Đã có dữ liệu mà tải lại lỗi: giữ danh sách cũ, báo ở trên (ui-screens.md §4.2) */}
      {hasData && errorMessage && (
        <ErrorAlert
          title="Không tải lại được danh sách"
          message={errorMessage}
          onRetry={handleRetry}
        />
      )}

      <ClassHealthNotesList
        childrenList={childrenList}
        isLoading={childrenQuery.isPending}
        errorMessage={hasData ? null : errorMessage}
        onRetry={handleRetry}
      />
    </div>
  );
}
