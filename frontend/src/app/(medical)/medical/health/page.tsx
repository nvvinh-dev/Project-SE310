"use client";

import { useEffect, useState } from "react";
import { NoticeBanner } from "@/components";
import type { SchoolChildResponse } from "@/types/health";
import { ChildSelector } from "./_components/ChildSelector";
import { GrowthMeasurementForm } from "./_components/GrowthMeasurementForm";
import { GrowthMeasurementHistory } from "./_components/GrowthMeasurementHistory";
import { useSchoolChildren } from "./_lib/health-api";

export default function MedicalHealthPage() {
  const [selectedChild, setSelectedChild] = useState<SchoolChildResponse | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const { data: schoolChildren } = useSchoolChildren();

  // Bỏ chọn nếu trẻ không còn trong danh sách sau khi tải lại (ví dụ nhận 404 trẻ bị xóa)
  const isSelectedChildValid =
    !selectedChild ||
    !schoolChildren ||
    schoolChildren.some((c) => c.id === selectedChild.id);
  const activeSelectedChild = isSelectedChildValid ? selectedChild : null;

  // Dải thông báo thành công role="status" tự ẩn sau 6 giây (ui-screens.md §4.2)
  useEffect(() => {
    if (!successNotice) return;
    const timer = setTimeout(() => {
      setSuccessNotice(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [successNotice]);

  const handleSuccessNotice = (message: string) => {
    setSuccessNotice(message);
  };

  return (
    <div className="space-y-6 py-8">
      {/* Tiêu đề trang (design-system.md §2) */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Chiều cao, cân nặng</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Ghi nhận chỉ số tăng trưởng và theo dõi lịch sử số đo của trẻ trong trường.
        </p>
      </div>

      {/* Dải thông báo thành công (design-system.md §5.1) */}
      {successNotice && (
        <NoticeBanner
          message={successNotice}
          onClose={() => setSuccessNotice(null)}
          role="status"
        />
      )}

      {/* Vùng [1]: Chọn trẻ */}
      <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs">
        <ChildSelector
          selectedChild={activeSelectedChild}
          onSelectChild={(child) => {
            setSelectedChild(child);
            setSuccessNotice(null);
          }}
        />
      </div>

      {/* Vùng [2]: Form nhập số đo mới (key reset form và error khi đổi trẻ) */}
      <GrowthMeasurementForm
        key={activeSelectedChild?.id ?? "none"}
        selectedChild={activeSelectedChild}
        onSuccessNotice={handleSuccessNotice}
      />

      {/* Vùng [3]: Lịch sử số đo của trẻ */}
      <GrowthMeasurementHistory selectedChild={activeSelectedChild} />
    </div>
  );
}