"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icons } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatVietnamShortDate } from "@/lib/datetime";
import { normalizeForSearch } from "@/lib/text";
import type { SchoolChildResponse } from "@/types/health";
import { useSchoolChildren } from "../_lib/health-api";

interface ChildSelectorProps {
  selectedChild: SchoolChildResponse | null;
  onSelectChild: (child: SchoolChildResponse | null) => void;
  className?: string;
}

export function ChildSelector({
  selectedChild,
  onSelectChild,
  className = "",
}: ChildSelectorProps) {
  const { data: children, isLoading, isError, error, refetch } = useSchoolChildren();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

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

  // Đặt lại activeIndex ngay trong lúc render theo mẫu React khi bộ lọc đổi
  const filterKey = `${searchTerm}|${isOpen}`;
  const [activeKey, setActiveKey] = useState(filterKey);
  if (activeKey !== filterKey) {
    setActiveKey(filterKey);
    setActiveIndex(-1);
  }

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        return;
      }
    }

    if (filteredChildren.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredChildren.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredChildren.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredChildren.length) {
        handleSelect(filteredChildren[activeIndex]);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-on-surface mb-1.5"
      >
        Trẻ <span className="text-error">*</span>
      </label>

      {/* Ô hiển thị lựa chọn hiện tại hoặc ô tìm kiếm */}
      {selectedChild && !isOpen ? (
        <div className="flex items-center justify-between rounded-2xl border border-primary/40 bg-surface-container-lowest px-4 py-2.5 shadow-xs transition-all">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold select-none">
              {selectedChild.fullName.slice(0, 1)}
            </span>
            <div className="truncate text-left">
              <span className="font-semibold text-sm text-on-surface">
                {selectedChild.fullName}
              </span>
              <span className="ml-2 text-xs text-on-surface-variant font-medium">
                (Sinh: {formatVietnamShortDate(selectedChild.dateOfBirth)})
              </span>
            </div>
          </div>
          <button
            id={inputId}
            type="button"
            onClick={handleOpenDropdown}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors ml-3 shrink-0 px-2 py-1 rounded-lg hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
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
            onKeyDown={handleKeyDown}
            placeholder="Tìm theo họ tên..."
            className="w-full rounded-2xl border border-slate-300 bg-surface-container-lowest px-4 py-2.5 pr-10 text-sm text-on-surface transition-all placeholder:text-outline/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant flex items-center">
            <Icons.Search />
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
                {toApiError(error).message}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-xs font-semibold text-primary underline hover:text-primary/80 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : filteredChildren.length === 0 ? (
            <div className="p-4 text-center text-xs text-on-surface-variant">
              {searchTerm ? "Không tìm thấy trẻ nào khớp với từ khóa." : "Danh sách trẻ rỗng."}
            </div>
          ) : (
            filteredChildren.map((child, index) => {
              const isSelected = selectedChild?.id === child.id;
              const isActive = activeIndex === index;

              return (
                <button
                  key={child.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(child)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-surface-container-low"
                      : isSelected
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{child.fullName}</span>
                    <span className="text-xs text-on-surface-variant shrink-0">
                      (Sinh ngày: {formatVietnamShortDate(child.dateOfBirth)})
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
