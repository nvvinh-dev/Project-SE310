"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  QuickHealthStatusRequest,
  QuickHealthStatusResponse,
} from "@/types/health";
import type {
  CreateIncidentRequest,
  IncidentResponse,
} from "@/types/incident";
import { HOMEROOM_CHILDREN_QUERY_KEY } from "@/app/(teacher)/teacher/attendance/_lib/attendance-api";

export { useHomeroomChildren } from "@/app/(teacher)/teacher/attendance/_lib/attendance-api";

export function useCreateQuickHealthStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: QuickHealthStatusRequest) => {
      const res = await apiClient.post<ApiResponse<QuickHealthStatusResponse>>(
        "/api/quick-health-statuses",
        request
      );
      return res.data.data;
    },
    onError: () => {
      // Khi trẻ không còn thuộc lớp (404), làm mới danh sách lớp
      void queryClient.invalidateQueries({ queryKey: HOMEROOM_CHILDREN_QUERY_KEY });
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateIncidentRequest) => {
      const res = await apiClient.post<ApiResponse<IncidentResponse>>(
        "/api/incidents",
        request
      );
      return res.data.data;
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: HOMEROOM_CHILDREN_QUERY_KEY });
    },
  });
}

export function useAttachIncidentPhotos() {
  return useMutation({
    mutationFn: async ({
      incidentId,
      files,
    }: {
      incidentId: string;
      files: File[];
    }) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append("photos", file);
      }

      const res = await apiClient.post<ApiResponse<IncidentResponse>>(
        `/api/incidents/${incidentId}/photos`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data.data;
    },
  });
}
