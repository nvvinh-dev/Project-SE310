"use client";

import React, { useId } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Icons } from "./Icons";

export type ConfirmVariant = "primary" | "danger" | "warning";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

const ICON_CONFIG: Record<
  ConfirmVariant,
  { icon: React.ReactNode; bgClass: string; textClass: string; buttonVariant: "primary" | "danger" }
> = {
  danger: {
    icon: <Icons.Trash />,
    bgClass: "bg-error-container",
    textClass: "text-error",
    buttonVariant: "danger",
  },
  warning: {
    icon: <Icons.Alert />,
    bgClass: "bg-amber-100",
    textClass: "text-amber-700",
    buttonVariant: "danger",
  },
  primary: {
    icon: <Icons.Info />,
    bgClass: "bg-surface-container-low",
    textClass: "text-primary",
    buttonVariant: "primary",
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  const titleId = useId();
  const config = ICON_CONFIG[variant];

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch {
      // Lỗi được xử lý bởi onError của mutation/caller, tránh unhandled promise rejection
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
      showCloseButton={!isLoading}
      ariaLabelledBy={titleId}
    >
      <div className="flex flex-col items-center text-center">
        {/* Biểu tượng trạng thái */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shrink-0 shadow-sm ${config.bgClass} ${config.textClass}`}
        >
          {config.icon}
        </div>

        {/* Tiêu đề & Nội dung */}
        <h3 id={titleId} className="text-lg font-bold text-on-surface mb-2 leading-snug">
          {title}
        </h3>
        <div className="text-sm text-on-surface-variant leading-relaxed mb-6">
          {message}
        </div>

        {/* Nút hành động */}
        <div className="flex w-full items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>

          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
