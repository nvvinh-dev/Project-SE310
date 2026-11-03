"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { WeeklyMenuResponse } from "@/types/menu";

export const WEEKLY_MENU_QUERY_KEY = "weekly-menus";

export const weeklyMenuQueryKey = (weekStartDate: string) =>
  [WEEKLY_MENU_QUERY_KEY, { weekStartDate }] as const;

/**
 * Hook tải thực đơn tuần của nhà trường (FR-MENU-02, UC-MENU-02, AC-MENU-02).
 * - weekStartDate: ngày thứ Hai của tuần dạng yyyy-MM-dd.
 * - Tuần chưa có thực đơn (404 Not Found) được xem là trạng thái rỗng hợp lệ (UC-MENU-02 E1),
 *   trả về data: null để giao diện hiển thị EmptyState mà không báo lỗi đỏ (SCR-PAR-07).
 * - retry: false theo frontend-conventions.md §3.3 để tránh trễ 7 giây khi người dùng chọn tuần chưa có thực đơn.
 */
export function useWeeklyMenu(weekStartDate: string) {
  return useQuery<WeeklyMenuResponse | null>({
    queryKey: weeklyMenuQueryKey(weekStartDate),
    queryFn: async () => {
      if (!weekStartDate) return null;
      try {
        const res = await apiClient.get<ApiResponse<WeeklyMenuResponse>>(
          "/api/weekly-menus",
          {
            params: { weekStartDate },
          }
        );
        return res.data.data ?? null;
      } catch (err: unknown) {
        // Tuần chưa có thực đơn: backend trả 404 "Chưa có thực đơn cho tuần này."
        // ui-screens.md SCR-PAR-07: hiển thị "Nhà trường chưa đăng thực đơn cho tuần này.", không phải lỗi.
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: Boolean(weekStartDate),
    retry: false,
  });
}
