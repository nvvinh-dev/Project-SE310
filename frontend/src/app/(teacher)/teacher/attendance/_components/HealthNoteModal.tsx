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
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-full bg-amber-100 text-amber-600" aria-hidden="true">
            <Icons.Alert />
          </span>
          <span>Lưu ý sức khỏe của trẻ</span>
        </div>
      }
      description={`Thông tin y tế đặc biệt cần chú ý ở trẻ ${child.fullName}`}
      size="md"
    >
      <div className="space-y-4 pt-1">
        <div className="p-4 rounded-2xl bg-amber-100">
          <p className="text-xs font-semibold text-amber-800 mb-1">Ghi chú của Y tế</p>
          <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
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
