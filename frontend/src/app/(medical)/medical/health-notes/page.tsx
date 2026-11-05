"use client";

import { useEffect, useState } from "react";
import { ApiErrorAlert, Icons, NoticeBanner } from "@/components";
import type { SchoolChildResponse } from "@/types/health";
import { ChildSelector } from "../health/_components/ChildSelector";
import { useSchoolChildren } from "../health/_lib/health-api";
import { HealthNotesForm } from "./_components/HealthNotesForm";

// SCR-MED-03 — Lưu ý sức khỏe (ui-screens.md §8)
// Vai trò: Y tế (Medical) · Route: /medical/health-notes (không có query parameter)
// Tuyệt đối không chứa thông tin lớp hay điểm danh (D40 mục 3, D45)
export default function MedicalHealthNotesPage() {
  const [selectedChild, setSelectedChild] = useState<SchoolChildResponse | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: schoolChildren } = useSchoolChildren();

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
    setSelectedChild(updatedChild);
    setSubmitError(null);
    const actionMessage = updatedChild.healthNotes?.trim()
      ? `Đã cập nhật lưu ý sức khỏe cho trẻ ${updatedChild.fullName}.`
      : `Đã xóa lưu ý sức khỏe của trẻ ${updatedChild.fullName}.`;
    setSuccessNotice(actionMessage);
  };

  const handleError = (err: unknown) => {
    setSuccessNotice(null);
    setSubmitError(err);
  };

  const handleStartSubmit = () => {
    setIsSubmitting(true);
    setSuccessNotice(null);
    setSubmitError(null);
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

      {/* Dải thông báo thành công (ui-screens.md §4.2) */}
      {successNotice && (
        <NoticeBanner
          message={successNotice}
          onClose={() => setSuccessNotice(null)}
          role="status"
        />
      )}

      {/* Dải thông báo lỗi ghi dữ liệu role="alert", không tự ẩn (ui-screens.md §4.2) */}
      {submitError != null && (
        <div className="relative">
          <ApiErrorAlert error={submitError} />
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            aria-label="Đóng thông báo lỗi"
            className="absolute top-3 right-3 p-1 rounded-full text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
          >
            <Icons.Close />
          </button>
        </div>
      )}

      {/* Vùng [1]: Chọn trẻ toàn trường (ui-screens.md SCR-MED-03 Vùng 1) */}
      <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs">
        <ChildSelector
          selectedChild={currentChild}
          disabled={isSubmitting}
          onSelectChild={(child) => {
            if (isSubmitting) return;
            setSelectedChild(child);
            setSuccessNotice(null);
            // Theo ui-screens.md §4.2: Dải lỗi ghi dữ liệu chỉ mất khi bấm đóng hoặc bắt đầu một thao tác ghi khác.
            // Không xóa submitError tại đây khi đổi trẻ.
          }}
        />
      </div>

      {/* Vùng [2]: Form ghi và cập nhật lưu ý sức khỏe (ui-screens.md SCR-MED-03 Vùng 2) */}
      {/* Không gắn key={currentChild?.id} để tránh unmount form nuốt mất lỗi 404 từ API (khi gặp 404 trẻ bị xóa, cache school-children làm mới khiến activeSelectedChild về null, form về trạng thái chưa chọn trẻ và dải lỗi alert phía trên được giữ nguyên cho người dùng đọc) */}
      <HealthNotesForm
        selectedChild={currentChild}
        onSuccess={handleSuccess}
        onError={handleError}
        onStartSubmit={handleStartSubmit}
        onSettled={() => setIsSubmitting(false)}
      />
    </div>
  );
}
