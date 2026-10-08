"use client";

import React from "react";
import { Icons } from "./Icons";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  siblingCount?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  siblingCount = 1,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems === 0)) {
    return null;
  }

  // Thuật toán sinh danh sách số trang có dấu ba chấm
  const generatePageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, "...", ...middleRange, "...", totalPages];
    }

    return [];
  };

  const pages = generatePageNumbers();

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Tính số lượng bản ghi hiển thị (nếu có truyền totalItems và pageSize)
  const startItem = pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
  const endItem = pageSize && totalItems ? Math.min(currentPage * pageSize, totalItems) : undefined;

  return (
    <nav
      aria-label="Phân trang"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 ${className}`}
    >
      {/* Thông tin số lượng */}
      <div className="text-xs text-on-surface-variant font-medium select-none">
        {totalItems !== undefined && startItem && endItem ? (
          <span>
            Hiển thị <strong className="text-on-surface">{startItem}</strong> -{" "}
            <strong className="text-on-surface">{endItem}</strong> trong{" "}
            <strong className="text-on-surface">{totalItems}</strong> kết quả
          </span>
        ) : (
          <span>
            Trang <strong className="text-on-surface">{currentPage}</strong> /{" "}
            <strong className="text-on-surface">{Math.max(1, totalPages)}</strong>
          </span>
        )}
      </div>

      {/* Điều khiển phân trang */}
      <div className="flex items-center gap-1.5 select-none">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          aria-label="Trang trước"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-on-surface hover:bg-surface-container-low active:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Icons.ChevronLeft />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Danh sách trang (ẩn trên mobile hẹp để tránh tràn vỡ giao diện) */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`dots-${idx}`}
                  className="px-2 py-1 text-xs text-outline select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(page);
            const isCurrent = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isCurrent ? "page" : undefined}
                className={`min-w-8 h-8 px-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface hover:bg-surface-container-low active:bg-slate-200"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Hiển thị số trang rút gọn trên mobile */}
        <div className="sm:hidden text-xs font-semibold text-on-surface px-2">
          {currentPage} / {Math.max(1, totalPages)}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          aria-label="Trang sau"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-on-surface hover:bg-surface-container-low active:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Sau</span>
          <Icons.ChevronRight />
        </button>
      </div>
    </nav>
  );
}
