"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { NotificationPageResponse } from "@/types/notification";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export const myNotificationsQueryKey = (page: number, pageSize: number) =>
  [...NOTIFICATIONS_QUERY_KEY, { page, pageSize }] as const;

export interface UseMyNotificationsParams {
  page?: number;
  pageSize?: number;
}

/**
 * Lấy danh sách thông báo in-app của tài khoản phụ huynh đang đăng nhập (FR-NOTI-01, UC-NOTI-01, AC-NOTI-01, AC-NOTI-02)
 * GET /api/notifications?page={page}&pageSize={pageSize}
 * Server phân trang; mặc định page = 1, pageSize = 20.
 */
export function useMyNotifications({
  page = 1,
  pageSize = 20,
}: UseMyNotificationsParams = {}) {
  return useQuery({
    queryKey: myNotificationsQueryKey(page, pageSize),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NotificationPageResponse>>(
        "/api/notifications",
        {
          params: { page, pageSize },
        }
      );
      return res.data.data;
    },
  });
}
