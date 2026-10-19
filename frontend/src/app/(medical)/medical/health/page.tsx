"use client";

import { useEffect, useState } from "react";
import type { SchoolChildResponse } from "@/types/health";
import { ChildSelector } from "./_components/ChildSelector";
import { GrowthMeasurementForm } from "./_components/GrowthMeasurementForm";
import { GrowthMeasurementHistory } from "./_components/GrowthMeasurementHistory";

export default function MedicalHealthPage() {
  const [selectedChild, setSelectedChild] = useState<SchoolChildResponse | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

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
    <div className="space-y-6">
      {/* Tiêu đề trang (design-system.md §2) */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Chiều cao, cân nặng</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Ghi nhận chỉ số tăng trưởng và theo dõi lịch sử số đo của trẻ trong trường.
        </p>
      </div>

      {/* Dải thông báo thành công */}
      {successNotice && (
        <div
          role="status"
          className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary-fixed/40 p-4 text-on-primary-fixed shadow-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
              ✓
            </span>
            <span className="text-sm font-semibold">{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors p-1 rounded-md"
            aria-label="Đóng thông báo"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Vùng [1]: Chọn trẻ toàn trường */}
      <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-5 sm:p-6 shadow-xs">
        <ChildSelector
          selectedChild={selectedChild}
          onSelectChild={(child) => {
            setSelectedChild(child);
            setSuccessNotice(null);
          }}
        />
      </div>

      {/* Vùng [2]: Form nhập số đo mới */}
      <GrowthMeasurementForm
        selectedChild={selectedChild}
        onSuccessNotice={handleSuccessNotice}
      />

      {/* Vùng [3]: Lịch sử số đo của trẻ */}
      <GrowthMeasurementHistory selectedChild={selectedChild} />
    </div>
  );
}