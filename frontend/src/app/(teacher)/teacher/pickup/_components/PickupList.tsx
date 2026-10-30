"use client";

import React from "react";
import { EmptyState, ErrorAlert, LoadingSpinner } from "@/components";
import type { HomeroomChildResponse } from "@/types/attendance";
import type { PickupRowItem } from "../_lib/pickup-helpers";
import { PickupRow } from "./PickupRow";

interface PickupListProps {
  items: PickupRowItem[];
  isClassEmpty: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onOpenVerification: (child: HomeroomChildResponse) => void;
}

export function PickupList({
  items,
  isClassEmpty,
  isLoading,
  errorMessage,
  onRetry,
  onOpenVerification,
}: PickupListProps) {
  if (isLoading) {
    return <LoadingSpinner label="Đang tải danh sách đón về..." />;
  }

  if (errorMessage) {
    return (
      <ErrorAlert
        title="Không tải được danh sách đón về"
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  if (isClassEmpty) {
    return (
      <EmptyState
        title="Chưa có trẻ trong lớp"
        message="Chưa có trẻ nào trong lớp chủ nhiệm của bạn. Nếu bạn chưa được phân công lớp, liên hệ Ban giám hiệu."
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <PickupRow
          key={item.child.id}
          item={item}
          onOpenVerification={onOpenVerification}
        />
      ))}
    </ul>
  );
}
