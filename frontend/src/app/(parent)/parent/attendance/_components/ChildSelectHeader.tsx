"use client";

import { Select } from "@/components";
import type { MyChildResponse } from "@/types/child";

interface ChildSelectHeaderProps {
  childrenList: MyChildResponse[];
  selectedChildId: string;
  onSelectChild: (childId: string) => void;
  title?: string;
  subtitle?: string;
}

export function ChildSelectHeader({
  childrenList,
  selectedChildId,
  onSelectChild,
  title = "Điểm danh của con",
  subtitle,
}: ChildSelectHeaderProps) {
  const options = childrenList.map((c) => ({
    value: c.id,
    label: c.fullName,
  }));

  const singleChild = childrenList.length === 1 ? childrenList[0] : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between min-w-0">
      <div className="space-y-1 min-w-0">
        <h1 className="text-2xl font-bold text-on-surface wrap-anywhere">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-on-surface-variant wrap-anywhere">
            {subtitle}
          </p>
        )}
        {singleChild && (
          <p className="text-sm text-on-surface-variant min-w-0">
            Con:{" "}
            <span className="font-semibold text-primary wrap-anywhere">
              {singleChild.fullName}
            </span>
          </p>
        )}
      </div>

      {/* ui-screens.md §10: Một con thì chọn sẵn và không cần ô chọn; nhiều con thì ô chọn ở đầu màn hình */}
      {/* Bỏ disabled để không làm mất focus bàn phím về body khi chuyển trẻ (design-system.md §7) */}
      {childrenList.length > 1 && (
        <div className="w-full sm:w-64 min-w-0">
          <Select
            label="Chọn con"
            value={selectedChildId}
            onChange={(e) => onSelectChild(e.target.value)}
            options={options}
          />
        </div>
      )}
    </div>
  );
}
