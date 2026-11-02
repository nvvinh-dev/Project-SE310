"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingSpinner, NoticeBanner } from "@/components";
import type { SchoolChildResponse } from "@/types/health";
import { ChildSelector } from "../../_components/ChildSelector";
import { useSchoolChildren } from "../health/_lib/health-api";
import { HealthNotesForm } from "./_components/HealthNotesForm";

// SCR-MED-03 — Lưu ý sức khỏe (ui-screens.md)
// Vai trò: Y tế (Medical) · Tuyệt đối không chứa thông tin lớp hay điểm danh (D40 mục 3, D45)
function MedicalHealthNotesContent() {
  const searchParams = useSearchParams();
  const queryChildId = searchParams.get("childId");

  const [selectedChildOverride, setSelectedChildOverride] = useState<SchoolChildResponse | null | undefined>(undefined);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const { data: schoolChildren } = useSchoolChildren();

  // Khởi tạo trẻ được chọn từ query param ?childId= nếu người dùng chưa chủ động đổi trẻ (LOGIC-01)
  const queryMatchedChild = useMemo(() => {
    if (!queryChildId || !schoolChildren) return null;
    return schoolChildren.find((c) => c.id === queryChildId) ?? null;
  }, [queryChildId, schoolChildren]);

  const selectedChild = selectedChildOverride !== undefined ? selectedChildOverride : queryMatchedChild;

  // Bỏ chọn nếu trẻ không còn trong danh sách sau khi tải lại (ví dụ nhận 404 trẻ bị xóa)
  const isSelectedChildValid =
    !selectedChild ||
    !schoolChildren ||
    schoolChildren.some((c) => c.id === selectedChild.id);
  const activeSelectedChild = isSelectedChildValid ? selectedChild : null;

  // Lấy dữ liệu mới nhất của trẻ từ cache schoolChildren
  const selectedSchoolChild = schoolChildren?.find((c) => c.id === activeSelectedChild?.id);
  const currentChild = selectedSchoolChild ?? activeSelectedChild;

  // Dải thông báo thành công role="status" tự ẩn sau 6 giây (ui-screens.md §4.2)
  useEffect(() => {
    if (!successNotice) return;
    const timer = setTimeout(() => {
      setSuccessNotice(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [successNotice]);

  const handleSuccess = (updatedChild: SchoolChildResponse) => {
    setSelectedChildOverride(updatedChild);
    const actionMessage = updatedChild.healthNotes?.trim()
      ? `Đã cập nhật lưu ý sức khỏe cho trẻ ${updatedChild.fullName}.`
      : `Đã xóa lưu ý sức khỏe của trẻ ${updatedChild.fullName}.`;
    setSuccessNotice(actionMessage);
  };

  return (
    <div className="space-y-6 py-8">
      {/* Tiêu đề trang (design-system.md §2) */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Lưu ý sức khỏe</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Ghi nhận và cập nhật lưu ý sức khỏe (dị ứng, bệnh nền) của trẻ theo thông tin phụ huynh cung cấp.
        </p>
      </div>

      {/* Dải thông báo thành công (design-system.md §5.1, ui-screens.md §4.2) */}
      {successNotice && (
        <NoticeBanner
          message={successNotice}
          onClose={() => setSuccessNotice(null)}
          role="status"
        />
      )}

      {/* Vùng [1]: Chọn trẻ toàn trường (ui-screens.md SCR-MED-03 Vùng 1) */}
      <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs">
        <ChildSelector
          selectedChild={currentChild}
          onSelectChild={(child) => {
            setSelectedChildOverride(child);
            setSuccessNotice(null);
          }}
        />
      </div>

      {/* Vùng [2]: Form ghi và cập nhật lưu ý sức khỏe (ui-screens.md SCR-MED-03 Vùng 2) */}
      <HealthNotesForm
        key={currentChild?.id ?? "none"}
        selectedChild={currentChild}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default function MedicalHealthNotesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 py-8">
          <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-12 shadow-xs">
            <LoadingSpinner label="Đang tải..." />
          </div>
        </div>
      }
    >
      <MedicalHealthNotesContent />
    </Suspense>
  );
}
