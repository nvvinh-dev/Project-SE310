"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  GrowthMeasurementRequest,
  GrowthMeasurementResponse,
  SchoolChildResponse,
} from "@/types/health";

export const SCHOOL_CHILDREN_QUERY_KEY = ["school-children"] as const;
export const GROWTH_MEASUREMENTS_QUERY_PREFIX = "growth-measurements" as const;

export const growthMeasurementsQueryKey = (childId: string) =>
  [GROWTH_MEASUREMENTS_QUERY_PREFIX, childId] as const;

// Danh sách trẻ toàn trường cho Y tế chọn (D45 mục 3)
export function useSchoolChildren() {
  return useQuery({
    queryKey: SCHOOL_CHILDREN_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<SchoolChildResponse[]>>(
        "/api/school-children"
      );
      return res.data.data ?? [];
    },
  });
}

// Lịch sử số đo tăng trưởng của một trẻ (mới nhất trước, không phân trang - D40 mục 4)
export function useGrowthMeasurements(childId: string | null) {
  return useQuery({
    queryKey: childId ? growthMeasurementsQueryKey(childId) : [GROWTH_MEASUREMENTS_QUERY_PREFIX],
    queryFn: async () => {
      if (!childId) return [];
      const res = await apiClient.get<ApiResponse<GrowthMeasurementResponse[]>>(
        `/api/children/${childId}/growth-measurements`
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(childId),
    retry: false,
  });
}

// Y tế ghi số đo mới cho trẻ
export function useCreateGrowthMeasurement(childId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: GrowthMeasurementRequest) => {
      if (!childId) throw new Error("Chưa chọn trẻ.");
      const res = await apiClient.post<ApiResponse<GrowthMeasurementResponse>>(
        `/api/children/${childId}/growth-measurements`,
        body
      );
      return res.data.data as GrowthMeasurementResponse;
    },
    onSuccess: () => {
      if (childId) {
        queryClient.invalidateQueries({
          queryKey: growthMeasurementsQueryKey(childId),
        });
      }
    },
    onError: (error: unknown) => {
      // Trẻ không còn tồn tại -> 404, tải lại danh sách trẻ (ui-screens.md §8)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        queryClient.invalidateQueries({ queryKey: SCHOOL_CHILDREN_QUERY_KEY });
      }
    },
  });
}
