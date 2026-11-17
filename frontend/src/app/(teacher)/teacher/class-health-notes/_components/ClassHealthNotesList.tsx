"use client";

import React from "react";
import { EmptyState, ErrorAlert, Icons, LoadingSpinner } from "@/components";
import type { HomeroomChildResponse } from "@/types/attendance";

interface ClassHealthNotesListProps {
  childrenList: HomeroomChildResponse[];
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
}

// Vùng [1] SCR-TCH-05: chỉ xem, không sửa; giữ đúng thứ tự API trả về
export function ClassHealthNotesList({
  childrenList,
  isLoading,
  errorMessage,
  onRetry,
}: ClassHealthNotesListProps) {
  if (isLoading) {
    return <LoadingSpinner label="Đang tải lưu ý sức khỏe của lớp..." />;
  }

  if (errorMessage) {
    return (
      <ErrorAlert
        title="Không tải được lưu ý sức khỏe của lớp"
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  if (childrenList.length === 0) {
    return (
      <EmptyState
        title="Chưa có trẻ trong lớp"
        message="Chưa có trẻ nào trong lớp chủ nhiệm của bạn. Nếu bạn chưa được phân công lớp, liên hệ Ban giám hiệu."
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {childrenList.map((child) => {
        const notes = child.healthNotes?.trim();

        if (!notes) {
          return (
            <li
              key={child.id}
              className="rounded-2xl border border-slate-200/70 bg-surface-container-low/40 p-3.5 sm:p-4 shadow-xs flex items-center gap-2.5 flex-wrap min-w-0"
            >
              <span className="font-semibold text-base text-on-surface wrap-anywhere">
                {child.fullName}
              </span>
              <span className="text-xs sm:text-sm text-outline">— Không có lưu ý</span>
            </li>
          );
        }

        return (
          <li
            key={child.id}
            className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 sm:p-4 shadow-xs flex items-start gap-3 min-w-0"
          >
            <span
              className="p-1.5 rounded-full bg-amber-100 text-amber-700 shrink-0"
              aria-hidden="true"
            >
              <Icons.Alert />
            </span>
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-bold text-base text-on-surface wrap-anywhere">
                  {child.fullName}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 whitespace-nowrap">
                  Có lưu ý sức khỏe
                </span>
              </div>
              {/* Văn bản thuần, giữ xuống dòng (ui-screens.md §4.4) */}
              <p className="text-sm text-on-surface whitespace-pre-wrap wrap-anywhere leading-relaxed">
                {notes}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
