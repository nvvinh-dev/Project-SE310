"use client";

import React, { useEffect } from "react";
import { Icons } from "./Icons";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnBackdropClick = true,
  showCloseButton = true,
  className = "",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* Dialog box */}
      <div
        className={`relative w-full rounded-3xl bg-surface-container-lowest p-6 shadow-2xl transition-all duration-200 z-10 my-8 text-left ${SIZE_CLASSES[size]} ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="space-y-1">
              {title && (
                <h3 className="text-lg font-bold text-on-surface leading-snug">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng hộp thoại"
                className="shrink-0 p-1.5 rounded-full text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
              >
                <Icons.Close />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="text-sm text-on-surface">{children}</div>
      </div>
    </div>
  );
}
