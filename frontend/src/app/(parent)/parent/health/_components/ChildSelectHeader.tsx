"use client";

import { Select } from "@/components";
import type { MyChildResponse } from "@/types/child";

interface ChildSelectHeaderProps {
  childrenList: MyChildResponse[];
  selectedChildId: string;
  onSelectChild: (childId: string) => void;
  isLoading?: boolean;
}

// SCR-PAR-03 Vùng [1]: Tiêu đề trang và Chọn con
export function ChildSelectHeader({
  childrenList,
  selectedChildId,
  onSelectChild,
  isLoading,
}: ChildSelectHeaderProps) {
  const options = childrenList.map((c) => ({
    value: c.id,
    label: c.fullName,
  }));

  const singleChild = childrenList.length === 1 ? childrenList[0] : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-on-surface">
          Sức khỏe và sự cố của con
        </h1>
        {singleChild && (
          <p className="text-sm text-on-surface-variant">
            Con:{" "}
            <span className="font-semibold text-primary">
              {singleChild.fullName}
            </span>
          </p>
        )}
      </div>

      {/* ui-screens.md §10: Một con thì chọn sẵn và không cần ô chọn; nhiều con thì ô chọn ở đầu màn hình */}
      {childrenList.length > 1 && (
        <div className="w-full sm:w-64">
          <Select
            label="Chọn con"
            value={selectedChildId}
            disabled={isLoading}
            onChange={(e) => onSelectChild(e.target.value)}
            options={options}
          />
        </div>
      )}
    </div>
  );
}
