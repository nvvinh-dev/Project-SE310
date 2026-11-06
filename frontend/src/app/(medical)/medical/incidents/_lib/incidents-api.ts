"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { NotificationPageResponse } from "@/types/notification";

export const NOTIFICATIONS_QUERY_PREFIX = "notifications" as const;

export function notificationsQueryKey(page: number, pageSize: number = 20) {
  return [NOTIFICATIONS_QUERY_PREFIX, { page, pageSize }] as const;
}

// FR-NOTI-02: Y tế xem danh sách thông báo sự cố (UC-NOTI-01, AC-NOTI-03, D25, D39 mục 6)
// GET /api/notifications?page=&pageSize=
export function useIncidentNotifications(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: notificationsQueryKey(page, pageSize),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NotificationPageResponse>>(
        "/api/notifications",
        {
          params: { page, pageSize },
        }
      );
      return res.data.data;
    },
    placeholderData: keepPreviousData, // frontend-conventions.md §3.4
  });
}
