"use client";

import React from "react";
import { Icons } from "./Icons";
import { Button } from "./Button";

// ==========================================
// 1. LOADING SPINNER
// ==========================================
export interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  label = "Đang tải dữ liệu...",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center min-h-[200px] ${className}`}
    >
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-xs font-medium text-on-surface-variant">{label}</p>
    </div>
  );
}

// ==========================================
// 2. EMPTY STATE
// ==========================================
export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "Không có dữ liệu",
  message = "Chưa có bản ghi nào để hiển thị trong mục này.",
  icon,
  actionText,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 rounded-3xl bg-surface-container-lowest border border-slate-200/80 text-center shadow-sm min-h-[240px] max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-3xl bg-surface-container-low text-primary flex items-center justify-center mb-3.5 shadow-inner">
        {icon || <Icons.Empty />}
      </div>
      <h3 className="text-base font-bold text-on-surface mb-1.5">{title}</h3>
      <p className="text-xs text-on-surface-variant max-w-sm mb-5 leading-relaxed">
        {message}
      </p>
      {actionText && onAction && (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

// ==========================================
// 3. ERROR MESSAGE / ALERT
// ==========================================
export interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  title = "Đã xảy ra lỗi",
  message,
  onRetry,
  className = "",
}: ErrorAlertProps) {
  return (
    <div
      className={`rounded-2xl border border-red-200 bg-red-50 p-4 text-left flex items-start justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-error mt-0.5 shrink-0">
          <Icons.Alert />
        </div>
        <div>
          <h4 className="text-sm font-bold text-red-900">{title}</h4>
          <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>

      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          icon={<Icons.Refresh />}
          className="shrink-0 bg-white"
        >
          Thử lại
        </Button>
      )}
    </div>
  );
}
