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
