"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { SchoolChildResponse } from "@/types/health";
import { ChildSelector } from "../health/_components/ChildSelector";
import { SCHOOL_CHILDREN_QUERY_KEY, useSchoolChildren } from "../health/_lib/health-api";
import { HealthNoteCard } from "./_components/HealthNoteCard";
import { IncidentPhotosModal } from "./_components/IncidentPhotosModal";
import { TimelineList } from "./_components/TimelineList";
import { useHealthHistory } from "./_lib/history-api";

// SCR-MED-02 — Lịch sử sức khỏe và sự cố (ui-screens.md)
// Vai trò: Y tế (Medical) · Tuyệt đối không chứa thông tin lớp hay điểm danh (D40 mục 3, D45)
export default function MedicalHistoryPage() {
  const queryClient = useQueryClient();
  const [selectedChild, setSelectedChild] = useState<SchoolChildResponse | null>(null);
  const [viewingIncidentId, setViewingIncidentId] = useState<string | null>(null);

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
    isPending: isHistoryPending,
    isError: isHistoryError,
    error: historyError,
    refetch: refetchHistory,
  } = useHealthHistory(activeSelectedChild?.id ?? null);

  // Khi tải lịch sử bị lỗi (đặc biệt là 404 trẻ không còn tồn tại): làm mới danh sách trẻ toàn trường
  // theo ui-screens.md §4.2 và frontend-conventions.md §5
  useEffect(() => {
    if (isHistoryError) {
      void queryClient.invalidateQueries({ queryKey: SCHOOL_CHILDREN_QUERY_KEY });
    }
  }, [isHistoryError, queryClient]);

  // SCR-MED-02 Vùng 2: Lưu ý sức khỏe đọc từ schoolChildren theo id trẻ đang chọn, để khi SCR-MED-03
  // cập nhật danh sách thì SCR-MED-02 lập tức thấy lưu ý mới mà không cần nạp lại toàn trang
  const selectedSchoolChild = schoolChildren?.find((c) => c.id === activeSelectedChild?.id);
  const currentHealthNotes =
    selectedSchoolChild?.healthNotes ?? activeSelectedChild?.healthNotes ?? null;

  return (
    <div className="space-y-6 py-8">
      {/* Tiêu đề trang (design-system.md §2) */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Lịch sử sức khỏe và sự cố</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Theo dõi tổng hợp sự cố, sức khỏe nhanh và số đo tăng trưởng của trẻ trên cùng một dòng thời gian.
        </p>
      </div>

      {/* Vùng [1]: Chọn trẻ toàn trường (ui-screens.md Vùng 1) */}
      <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs">
        <ChildSelector
          selectedChild={activeSelectedChild}
          onSelectChild={(child) => setSelectedChild(child)}
        />
      </div>

      {/* Vùng [2]: Lưu ý sức khỏe của trẻ đang chọn (ui-screens.md Vùng 2) */}
      {activeSelectedChild && (
        <HealthNoteCard healthNotes={currentHealthNotes} />
      )}

      {/* Vùng [3]: Dòng thời gian gộp (Sự cố, Sức khỏe nhanh, Số đo) (ui-screens.md Vùng 3) */}
      <TimelineList
        selectedChildId={activeSelectedChild?.id ?? null}
        items={historyData?.items}
        isPending={isHistoryPending}
        isError={isHistoryError}
        error={historyError}
        refetch={refetchHistory}
        onViewPhotos={(incidentId) => setViewingIncidentId(incidentId)}
      />

      {/* Vùng [4]: Ảnh của sự cố (ui-screens.md Vùng 4, AC-HEALTH-18, D53) */}
      <IncidentPhotosModal
        isOpen={Boolean(viewingIncidentId)}
        onClose={() => setViewingIncidentId(null)}
        incidentId={viewingIncidentId}
      />
    </div>
  );
}
