"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { AttendanceResponse, HomeroomChildResponse } from "@/types/attendance";
export const HOMEROOM_CHILDREN_QUERY_KEY = ["homeroom-children"] as const;

export interface AttendanceHistoryParams {
  childId?: string;
  date?: string; // "YYYY-MM-DD"
  classId?: string;
}

export function useAttendanceHistory(params: AttendanceHistoryParams) {
  const { childId, date, classId } = params;

  return useQuery({
    queryKey: ["attendances", "history-filter", { childId, date, classId }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (childId) queryParams.set("childId", childId);
      if (date) queryParams.set("date", date);
      if (classId) queryParams.set("classId", classId);

      const res = await apiClient.get<ApiResponse<AttendanceResponse[]>>(
        `/api/attendances?${queryParams.toString()}`
      );
      return res.data.data ?? [];
    },
    retry: false,
  });
}

export function useHomeroomChildrenList() {
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
