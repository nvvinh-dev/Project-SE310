"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { AttendanceResponse } from "@/types/attendance";
import {
  HOMEROOM_CHILDREN_QUERY_KEY,
  useHomeroomChildren,
} from "../../attendance/_lib/attendance-api";

// Tái sử dụng query key và hook lấy danh sách trẻ từ module attendance (tránh trùng lặp code)
export { HOMEROOM_CHILDREN_QUERY_KEY, useHomeroomChildren, useHomeroomChildren as useHomeroomChildrenList };

export interface AttendanceHistoryParams {
  childId?: string;
  date?: string; // "YYYY-MM-DD"
  classId?: string;
}

export function useAttendanceHistory(params: AttendanceHistoryParams) {
  const { childId, date, classId } = params;
  const isEnabled = Boolean(childId || date);

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
    enabled: isEnabled,
    retry: false,
  });
}

