"use client";

import { Icons } from "@/components";
import { formatMeasurementDateTime } from "@/lib/datetime";
import type { NotificationResponse } from "@/types/notification";

interface IncidentNotificationCardProps {
  notification: NotificationResponse;
  className?: string;
}

export function IncidentNotificationCard({
  notification,
  className = "",
}: IncidentNotificationCardProps) {
  const formattedTime = formatMeasurementDateTime(notification.createdAtUtc);

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs ${className}`}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant border-b border-slate-100 pb-2.5">
        <span className="text-outline">
          <Icons.Clock />
        </span>
        <time dateTime={notification.createdAtUtc} className="font-semibold text-on-surface">
          {formattedTime}
        </time>
      </div>

      {/* Nội dung thông báo nguyên văn do backend soạn (D25, ui-screens.md §4.4) */}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-on-surface">
        {notification.message}
      </p>
    </div>
  );
}
