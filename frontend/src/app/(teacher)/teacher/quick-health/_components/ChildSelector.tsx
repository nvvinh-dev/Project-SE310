"use client";

import React, { useState } from "react";
import { Select, Icons } from "@/components";
import type { HomeroomChildResponse } from "@/types/attendance";
import { HealthNoteModal } from "@/app/(teacher)/teacher/attendance/_components/HealthNoteModal";

interface ChildSelectorProps {
  childrenList: HomeroomChildResponse[];
  selectedChildId: string;
  onSelectChild: (childId: string) => void;
  disabled?: boolean;
  error?: string;
}

export function ChildSelector({
  childrenList,
  selectedChildId,
  onSelectChild,
  disabled = false,
  error,
}: ChildSelectorProps) {
  const [showHealthNoteModal, setShowHealthNoteModal] = useState(false);

  const selectedChild = childrenList.find((c) => c.id === selectedChildId) ?? null;
  const hasHealthNotes = Boolean(
    selectedChild?.healthNotes && selectedChild.healthNotes.trim() !== ""
  );

  const options = childrenList.map((child) => ({
    value: child.id,
    label: child.fullName,
  }));

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <Select
            id="quick-health-child-select"
            label="Trẻ trong lớp"
            required
            placeholder="-- Chọn trẻ trong lớp --"
            options={options}
            value={selectedChildId}
            onChange={(e) => onSelectChild(e.target.value)}
            disabled={disabled || childrenList.length === 0}
            error={error}
            helperText={
              childrenList.length === 0
                ? "Lớp chưa có trẻ hoặc bạn chưa được phân công lớp chủ nhiệm."
                : undefined
            }
          />
        </div>

        {selectedChild && (
          <div className="sm:pb-1">
            {hasHealthNotes ? (
              <button
                type="button"
                onClick={() => setShowHealthNoteModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-100 text-amber-800 text-xs font-semibold hover:bg-amber-100/80 transition-colors cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
                title="Bấm để xem chi tiết lưu ý sức khỏe của trẻ"
              >
                <span className="p-1 rounded-full bg-amber-100 text-amber-600" aria-hidden="true">
                  <Icons.Alert />
                </span>
                <span>Có lưu ý sức khỏe — xem</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant font-medium px-2 py-1">
                Không có lưu ý sức khỏe đặc biệt
              </span>
            )}
          </div>
        )}
      </div>

      {/* Modal xem lưu ý sức khỏe của Y tế */}
      <HealthNoteModal
        child={selectedChild}
        isOpen={showHealthNoteModal}
        onClose={() => setShowHealthNoteModal(false)}
      />
    </div>
  );
}
