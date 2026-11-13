"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { NotificationPageResponse } from "@/types/notification";

// Cùng API xem thông báo của Phụ huynh và Y tế; backend chỉ trả thông báo gửi cho chính người gọi,
// với Admin là thông báo phản ánh mới (FR-NOTI-04, D39 mục 6). Phân trang ở server
export function useAdminNotifications(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["admin-notifications", { page, pageSize }],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NotificationPageResponse>>("/api/notifications", {
        params: { page, pageSize },
      });
      return res.data.data ?? { items: [], page, pageSize, totalCount: 0 };
    },
    placeholderData: keepPreviousData,
  });
}
