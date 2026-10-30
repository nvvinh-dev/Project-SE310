"use client";

import React from "react";
import { Button } from "@/components";
import type { HomeroomChildResponse } from "@/types/attendance";
import type { PickupRowItem } from "../_lib/pickup-helpers";
import { formatPickupDetails } from "../_lib/pickup-helpers";

interface PickupRowProps {
  item: PickupRowItem;
  onOpenVerification: (child: HomeroomChildResponse) => void;
}

export function PickupRow({ item, onOpenVerification }: PickupRowProps) {
  const { child, attendance, pickup } = item;

  // 1. Trẻ đã đón: Trần Thị B Đã đón 16:35 · Nguyễn Thị C · Người đón chính
  if (pickup) {
    const pickupDetails = formatPickupDetails(pickup);

    return (
      <li className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-bold text-base text-on-surface">
              {child.fullName}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-fixed/40 text-primary whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
              Đã đón
            </span>
          </div>
          <p className="text-xs sm:text-sm text-outline break-words">
            {pickupDetails}
          </p>
        </div>
      </li>
    );
  }

  // 2. Trẻ có mặt: Nguyễn Văn A Có mặt (Xác minh người đón ›)
  if (attendance?.status === "Present") {
    return (
      <li className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
          <span className="font-bold text-base text-on-surface break-words">
            {child.fullName}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-fixed/40 text-primary whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
            Có mặt
          </span>
        </div>

        <div className="shrink-0 self-stretch sm:self-auto">
          <Button
            variant="primary"
            onClick={() => onOpenVerification(child)}
            aria-label={`Xác minh người đón cho trẻ ${child.fullName}`}
            className="w-full sm:w-auto min-h-11 justify-center"
          >
            Xác minh người đón ›
          </Button>
        </div>
      </li>
    );
  }

  // 3. Trẻ vắng hoặc chưa điểm danh:
  // Lê Văn D Vắng có phép — không giao trẻ
  // Phạm Văn E Chưa điểm danh — không giao trẻ
  let statusBadge = (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-outline whitespace-nowrap shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-outline" aria-hidden="true" />
      Chưa điểm danh
    </span>
  );

  if (attendance?.status === "AbsentExcused") {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 whitespace-nowrap shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" aria-hidden="true" />
        Vắng có phép
      </span>
    );
  } else if (attendance?.status === "AbsentUnexcused") {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-error-container text-on-error-container whitespace-nowrap shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-error" aria-hidden="true" />
        Vắng không phép
      </span>
    );
  }

  return (
    <li className="rounded-2xl border border-slate-200/70 bg-surface-container-low/40 p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5 flex-wrap min-w-0">
        <span className="font-semibold text-base text-on-surface">
          {child.fullName}
        </span>
        {statusBadge}
        <span className="text-xs sm:text-sm text-outline">
          — không giao trẻ
        </span>
      </div>
    </li>
  );
}
