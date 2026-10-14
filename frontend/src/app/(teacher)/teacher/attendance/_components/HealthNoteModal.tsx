"use client";

import React from "react";
import { Button, Modal } from "@/components";
import type { HomeroomChildResponse } from "@/types/attendance";

interface HealthNoteModalProps {
  child: HomeroomChildResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HealthNoteModal({ child, isOpen, onClose }: HealthNoteModalProps) {
  if (!child) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-amber-700">
          <span className="p-1.5 rounded-xl bg-amber-100/80 text-amber-700">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <span>Lưu ý sức khỏe của trẻ</span>
        </div>
      }
      description={`Thông tin y tế đặc biệt cần chú ý đối với bé ${child.fullName}`}
      size="md"
    >
      <div className="space-y-4 pt-1">
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-on-surface">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">
            Ghi chú từ Y tế / Giáo viên
          </p>
          <p className="text-sm text-amber-950 font-medium whitespace-pre-wrap leading-relaxed">
            {child.healthNotes || "Không có lưu ý đặc biệt."}
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
