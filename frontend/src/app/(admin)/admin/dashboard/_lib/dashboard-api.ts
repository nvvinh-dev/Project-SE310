"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  AttendanceStatisticsResponse,
  ChildStatisticsResponse,
  RevenueStatisticsResponse,
} from "@/types/dashboard";

// Các thống kê của SCR-ADM-01 chung tiền tố "dashboard" theo đường dẫn /api/dashboard/...
export const CHILD_STATISTICS_QUERY_KEY = ["dashboard", "child-statistics"] as const;
export const ATTENDANCE_STATISTICS_QUERY_KEY = ["dashboard", "attendance-statistics"] as const;
export const REVENUE_STATISTICS_QUERY_KEY = ["dashboard", "revenue-statistics"] as const;

// FR-DASH-02: tổng số trẻ và số trẻ tách theo ba lớp
export function useChildStatistics() {
  return useQuery({
    queryKey: CHILD_STATISTICS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChildStatisticsResponse>>("/api/dashboard/child-statistics");
      // Thành công luôn có data; thiếu thì coi như lỗi, không hiện số 0 sai
      const data = res.data.data;
      if (data === null) throw new Error("Phản hồi không có dữ liệu.");
      return data;
    },
  });
}

// FR-DASH-03: tỷ lệ có mặt của tháng hiện tại, toàn trường và tách theo ba lớp
export function useAttendanceStatistics() {
  return useQuery({
    queryKey: ATTENDANCE_STATISTICS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AttendanceStatisticsResponse>>(
        "/api/dashboard/attendance-statistics",
      );
      const data = res.data.data;
      if (data === null) throw new Error("Phản hồi không có dữ liệu.");
      return data;
    },
  });
}

// FR-DASH-04: tổng thu của tháng hiện tại và số hóa đơn chưa thanh toán
export function useRevenueStatistics() {
  return useQuery({
    queryKey: REVENUE_STATISTICS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<RevenueStatisticsResponse>>("/api/dashboard/revenue-statistics");
      const data = res.data.data;
      if (data === null) throw new Error("Phản hồi không có dữ liệu.");
      return data;
    },
  });
}
