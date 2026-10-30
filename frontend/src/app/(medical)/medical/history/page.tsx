"use client";

import { useState } from "react";
import type { SchoolChildResponse } from "@/types/health";
import { ChildSelector } from "../health/_components/ChildSelector";
import { useSchoolChildren } from "../health/_lib/health-api";
import { HealthNoteCard } from "./_components/HealthNoteCard";
import { TimelineList } from "./_components/TimelineList";
import { useHealthHistory } from "./_lib/history-api";

// SCR-MED-02 — Lịch sử sức khỏe và sự cố (ui-screens.md dòng 886-920)
// Vai trò: Y tế (Medical) · Tuyệt đối không chứa thông tin lớp hay điểm danh (D40 mục 3, D45)
export default function MedicalHistoryPage() {
  const [selectedChild, setSelectedChild] = useState<SchoolChildResponse | null>(null);
  const { data: schoolChildren } = useSchoolChildren();

  // Bỏ chọn nếu trẻ không còn trong danh sách sau khi tải lại (ví dụ nhận 404 do trẻ bị xóa khỏi hệ thống)
  const isSelectedChildValid =
    !selectedChild ||
    !schoolChildren ||
    schoolChildren.some((c) => c.id === selectedChild.id);
  const activeSelectedChild = isSelectedChildValid ? selectedChild : null;

  // Lấy dữ liệu lịch sử gộp qua TanStack Query (FR-HEALTH-04)
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
    refetch: refetchHistory,
  } = useHealthHistory(activeSelectedChild?.id ?? null);

  // Lưu ý sức khỏe mới nhất ưu tiên lấy từ kết quả API lịch sử hoặc từ danh sách trẻ
  const currentHealthNotes =
    historyData?.child?.healthNotes !== undefined
      ? historyData.child.healthNotes
      : activeSelectedChild?.healthNotes ?? null;

  return (
    <div className="space-y-6 py-8">
      {/* Tiêu đề trang (design-system.md §2) */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Lịch sử sức khỏe và sự cố</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Theo dõi tổng hợp sự cố, sức khỏe nhanh và số đo tăng trưởng của trẻ trên cùng một dòng thời gian.
        </p>
      </div>

      {/* Vùng [1]: Chọn trẻ toàn trường (ui-screens.md §8) */}
      <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs">
        <ChildSelector
          selectedChild={activeSelectedChild}
          onSelectChild={(child) => setSelectedChild(child)}
        />
      </div>

      {/* Vùng [2]: Lưu ý sức khỏe của trẻ đang chọn */}
      {activeSelectedChild && (
        <HealthNoteCard
          healthNotes={currentHealthNotes}
          childId={activeSelectedChild.id}
        />
      )}

      {/* Vùng [3]: Dòng thời gian gộp (Sự cố, Sức khỏe nhanh, Số đo) */}
      <TimelineList
        selectedChildId={activeSelectedChild?.id ?? null}
        items={historyData?.items}
        isLoading={isHistoryLoading}
        isError={isHistoryError}
        error={historyError}
        refetch={refetchHistory}
      />
    </div>
  );
}
