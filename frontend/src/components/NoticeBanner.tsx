"use client";

import React from "react";
import { Icons } from "./Icons";

export interface NoticeBannerProps {
  message: string;
  onClose: () => void;
  role?: "status" | "alert";
  className?: string;
}

export function NoticeBanner({
  message,
  onClose,
  role = "status",
  className = "",
}: NoticeBannerProps) {
  const isStatus = role === "status";

  return (
    <div
      role={role}
      className={`rounded-2xl border p-4 flex items-start justify-between gap-3 ${
        isStatus
          ? "border-primary/20 bg-primary-fixed/30 text-on-surface"
          : "border-error/30 bg-error-container/40 text-on-error-container"
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className={`${isStatus ? "text-primary" : "text-error"} shrink-0 mt-0.5`}>
          {isStatus ? <Icons.Check /> : <Icons.Alert />}
        </span>
        <p className="text-sm font-semibold">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng thông báo"
        className="shrink-0 p-1 rounded-full text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
      >
        <Icons.Close />
      </button>
    </div>
  );
}
