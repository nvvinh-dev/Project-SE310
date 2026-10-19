"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icons } from "@/components";
import type { SchoolChildResponse } from "@/types/health";
import { useSchoolChildren } from "../_lib/health-api";
import { normalizeForSearch } from "../_lib/health-rules";

interface ChildSelectorProps {
  selectedChild: SchoolChildResponse | null;
  onSelectChild: (child: SchoolChildResponse | null) => void;
  className?: string;
}

export function formatDateOfBirth(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function ChildSelector({
  selectedChild,
  onSelectChild,
  className = "",
}: ChildSelectorProps) {
  const { data: children, isLoading, isError, refetch } = useSchoolChildren();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Đóng danh sách khi bấm ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lọc trẻ toàn trường theo họ tên ở client (D45 mục 3)
  const filteredChildren = useMemo(() => {
    if (!children) return [];
    const normalized = normalizeForSearch(searchTerm);
    if (!normalized) return children;
    return children.filter((child) =>
      normalizeForSearch(child.fullName).includes(normalized)
    );
  }, [children, searchTerm]);

  const handleSelect = (child: SchoolChildResponse) => {
    onSelectChild(child);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleOpenDropdown = () => {
    setIsOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-on-surface mb-1.5"
      >
        Trẻ toàn trường <span className="text-error">*</span>
      </label>

      {/* Ô hiển thị lựa chọn hiện tại hoặc nút mở tìm kiếm */}
      {selectedChild && !isOpen ? (
        <div className="flex items-center justify-between rounded-2xl border border-primary/40 bg-surface-container-lowest px-4 py-2.5 shadow-xs transition-all">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              {selectedChild.fullName.slice(0, 1)}
            </span>
            <div className="truncate text-left">
              <span className="font-semibold text-sm text-on-surface">
                {selectedChild.fullName}
              </span>
              <span className="ml-2 text-xs text-on-surface-variant font-medium">
                (Sinh: {formatDateOfBirth(selectedChild.dateOfBirth)})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenDropdown}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors ml-3 shrink-0 px-2 py-1 rounded-lg hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Đổi trẻ khác ▾
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            ref={searchInputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={`${inputId}-listbox`}
            aria-autocomplete="list"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Tìm theo họ tên trẻ..."
            className="w-full rounded-2xl border border-slate-300 bg-surface-container-lowest px-4 py-2.5 pr-10 text-sm text-on-surface transition-all placeholder:text-outline/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      )}

      {/* Danh sách thả xuống kết quả tìm kiếm */}
      {isOpen && (
        <div
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-surface-container-lowest py-1.5 shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4 text-xs text-on-surface-variant">
              <span className="mr-2">
                <Icons.Spinner />
              </span>
              Đang tải danh sách trẻ...
            </div>
          ) : isError ? (
            <div className="p-3 text-center">
              <p className="text-xs text-error font-medium mb-1">
                Không thể tải danh sách trẻ.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-xs font-semibold text-primary underline"
              >
                Thử lại
              </button>
            </div>
          ) : filteredChildren.length === 0 ? (
            <div className="p-4 text-center text-xs text-on-surface-variant">
              {searchTerm ? "Không tìm thấy trẻ nào khớp với từ khóa." : "Danh sách trẻ rỗng."}
            </div>
          ) : (
            filteredChildren.map((child) => {
              const isSelected = selectedChild?.id === child.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(child)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between hover:bg-surface-container-low ${
                    isSelected ? "bg-primary/10 font-semibold text-primary" : "text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{child.fullName}</span>
                    <span className="text-xs text-on-surface-variant shrink-0">
                      (Sinh ngày: {formatDateOfBirth(child.dateOfBirth)})
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-xs text-primary shrink-0 font-bold">
                      ✓ Đang chọn
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
