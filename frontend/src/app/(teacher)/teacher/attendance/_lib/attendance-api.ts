"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  AttendanceResponse,
  CheckInRequest,
  HomeroomChildResponse,
} from "@/types/attendance";

export const HOMEROOM_CHILDREN_QUERY_KEY = ["homeroom-children"] as const;
export const attendanceHistoryQueryKey = (dateStr: string) =>
  ["attendances", "history", dateStr] as const;

export function useHomeroomChildren() {
  return useQuery({
    queryKey: HOMEROOM_CHILDREN_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<HomeroomChildResponse[]>>(
        "/api/homeroom-children"
      );
      return res.data.data ?? [];
    },
  });
}

export function useTodayAttendances(dateStr: string) {
  return useQuery({
    queryKey: attendanceHistoryQueryKey(dateStr),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AttendanceResponse[]>>(
        `/api/attendances?date=${encodeURIComponent(dateStr)}`
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(dateStr),
  });
}

export function useCheckInMutation(todayStr: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CheckInRequest) => {
      const res = await apiClient.post<ApiResponse<AttendanceResponse>>(
        "/api/attendances",
        request
      );
      return res.data.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceHistoryQueryKey(todayStr),
      });
    },
  });
}
