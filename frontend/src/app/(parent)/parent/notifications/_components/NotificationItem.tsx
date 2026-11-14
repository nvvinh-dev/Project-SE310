"use client";

import { Icons } from "@/components";
import { formatVietnamDateTime } from "@/lib/datetime";
import type { NotificationResponse } from "@/types/notification";

interface NotificationItemProps {
  notification: NotificationResponse;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const formattedTime = formatVietnamDateTime(notification.createdAtUtc);

  return (
    <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-surface-container-lowest shadow-xs hover:border-slate-300 transition-colors min-w-0">
      {/* Icon thông báo */}
      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
        <Icons.Clipboard />
      </div>

      {/* Nội dung thông báo & Thời điểm */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
            Thông báo từ nhà trường
          </span>
          <time
            dateTime={notification.createdAtUtc}
            className="text-xs text-on-surface-variant font-mono shrink-0"
          >
            {formattedTime}
          </time>
        </div>

        {/* Nội dung nguyên văn do backend soạn (AC-NOTI-01) */}
        <p className="text-sm sm:text-base text-on-surface leading-relaxed wrap-anywhere select-text">
          {notification.message}
        </p>
      </div>
    </div>
  );
}
