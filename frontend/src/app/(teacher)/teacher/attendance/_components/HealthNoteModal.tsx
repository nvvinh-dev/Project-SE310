"use client";

import React from "react";
import { Button, Icons, Modal } from "@/components";
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
            <span className="text-amber-600 shrink-0">
              <Icons.Alert />
            </span>
          </span>
          <span>Lưu ý sức khỏe của trẻ</span>
        </div>
      }
      description={`Thông tin y tế đặc biệt cần chú ý ở trẻ ${child.fullName}`}
      size="md"
    >
      <div className="space-y-4 pt-1">
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-on-surface">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">
            Ghi chú của Y tế
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
