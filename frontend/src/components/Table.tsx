"use client";

import React from "react";
import { Icons } from "./Icons";
import { Button } from "./Button";

// ==========================================
// 1. BASE TABLE WRAPPER & SUBCOMPONENTS
// ==========================================
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

export function Table({ className = "", containerClassName = "", children, ...props }: TableProps) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-3xl border border-slate-200/90 bg-surface-container-lowest shadow-sm ${containerClassName}`}
    >
      <table className={`w-full text-left text-sm text-on-surface border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`bg-surface-container-low/80 text-xs uppercase tracking-wider text-outline border-b border-slate-200/80 font-bold ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-slate-100 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`transition-colors hover:bg-surface-container-low/50 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-5 py-3.5 text-left font-semibold text-outline text-xs select-none ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className = "", children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-5 py-4 align-middle text-on-surface ${className}`} {...props}>
      {children}
    </td>
  );
}

// ==========================================
// 2. TABLE SKELETON / LOADING STATE (AC-NFR-04)
// ==========================================
export interface TableLoadingProps {
  colSpan: number;
  rowCount?: number;
}

export function TableLoading({ colSpan, rowCount = 5 }: TableLoadingProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          <td colSpan={colSpan} className="px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="h-4 bg-slate-200 rounded-full w-1/4"></div>
              <div className="h-4 bg-slate-200 rounded-full w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded-full w-1/6"></div>
              <div className="h-4 bg-slate-100 rounded-full flex-1"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ==========================================
// 3. TABLE EMPTY STATE (AC-NFR-04)
// ==========================================
export interface TableEmptyProps {
  colSpan: number;
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export function TableEmpty({
  colSpan,
  title = "Không có dữ liệu",
  message = "Hiện chưa có bản ghi nào để hiển thị trong mục này.",
  actionText,
  onAction,
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-14 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-surface-container-low text-primary flex items-center justify-center mb-3 shadow-inner">
            <Icons.Empty />
          </div>
          <h3 className="text-base font-bold text-on-surface mb-1">{title}</h3>
          <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">{message}</p>
          {actionText && onAction && (
            <Button size="sm" variant="outline" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ==========================================
// 4. TABLE ERROR STATE (AC-NFR-04)
// ==========================================
export interface TableErrorProps {
  colSpan: number;
  message?: string;
  onRetry?: () => void;
}

export function TableError({
  colSpan,
  message = "Không thể tải dữ liệu. Vui lòng thử lại sau.",
  onRetry,
}: TableErrorProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center mb-3">
            <Icons.Alert />
          </div>
          <h3 className="text-sm font-bold text-on-surface mb-1">Đã có lỗi xảy ra</h3>
          <p className="text-xs text-error font-medium mb-4 max-w-xs">{message}</p>
          {onRetry && (
            <Button size="sm" variant="outline" icon={<Icons.Refresh />} onClick={onRetry}>
              Thử lại
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
