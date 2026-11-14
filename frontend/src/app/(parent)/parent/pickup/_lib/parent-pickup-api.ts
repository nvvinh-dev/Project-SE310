"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { PickupPersonResponse } from "@/types/pickup";
import {
  MY_CHILDREN_QUERY_KEY,
  useMyChildren,
} from "../../attendance/_lib/parent-attendance-api";

// Tái sử dụng query danh sách con từ module điểm danh phụ huynh (frontend-conventions.md §1)
export { MY_CHILDREN_QUERY_KEY, useMyChildren };

export const childPickupPersonsQueryKey = (childId: string) =>
  ["children", childId, "pickup-persons"] as const;

/**
 * Lấy danh sách người đón đã đăng ký của con (FR-PICKUP-03, UC-PICKUP-02, AC-PICKUP-03)
 * GET /api/children/{childId}/pickup-persons
 * Người đón chính trước, người dự phòng sau. URL ảnh khuôn mặt hết hạn sau 60 phút (D53).
 */
export function useChildPickupPersons(childId: string | null | undefined) {
  return useQuery({
    queryKey: childId ? childPickupPersonsQueryKey(childId) : ["children", "empty", "pickup-persons"],
    queryFn: async () => {
      if (!childId) return [];
      const res = await apiClient.get<ApiResponse<PickupPersonResponse[]>>(
        `/api/children/${childId}/pickup-persons`
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(childId),
    retry: false, // 404 là kết quả tra cứu bình thường khi trẻ chưa liên kết hoặc bị gỡ
  });
}

export interface CreatePickupPersonParams {
  childId: string;
  priority: 1 | 2;
  fullName: string;
  relationship: string;
  phoneNumber: string;
  citizenIdNumber: string;
  consentConfirmed: boolean;
  photoFile: File;
}

/**
 * Đăng ký người đón chính hoặc người đón dự phòng mới cho con (FR-PICKUP-03, POST multipart)
 */
export function useCreatePickupPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      childId,
      priority,
      fullName,
      relationship,
      phoneNumber,
      citizenIdNumber,
      consentConfirmed,
      photoFile,
    }: CreatePickupPersonParams) => {
      const formData = new FormData();
      formData.append("priority", String(priority));
      formData.append("fullName", fullName.trim());
      formData.append("relationship", relationship.trim());
      formData.append("phoneNumber", phoneNumber.trim());
      formData.append("citizenIdNumber", citizenIdNumber.trim());
      formData.append("consentConfirmed", String(consentConfirmed));
      formData.append("facePhoto", photoFile);

      // Bắt buộc đặt Content-Type: multipart/form-data để Axios không đổi FormData thành JSON (ui-screens.md SCR-PAR-04)
      const res = await apiClient.post<ApiResponse<PickupPersonResponse>>(
        `/api/children/${childId}/pickup-persons`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: childPickupPersonsQueryKey(variables.childId),
      });
    },
  });
}

export interface UpdatePickupPersonParams {
  childId: string;
  personId: string;
  fullName: string;
  relationship: string;
  phoneNumber: string;
  citizenIdNumber: string;
  consentConfirmed: boolean;
  photoFile?: File | null;
}

/**
 * Chỉnh sửa thông tin người đón đã đăng ký (FR-PICKUP-03, PUT multipart)
 * Không chọn ảnh mới nghĩa là giữ nguyên ảnh cũ.
 */
export function useUpdatePickupPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      childId,
      personId,
      fullName,
      relationship,
      phoneNumber,
      citizenIdNumber,
      consentConfirmed,
      photoFile,
    }: UpdatePickupPersonParams) => {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("relationship", relationship.trim());
      formData.append("phoneNumber", phoneNumber.trim());
      formData.append("citizenIdNumber", citizenIdNumber.trim());
      formData.append("consentConfirmed", String(consentConfirmed));
      if (photoFile) {
        formData.append("facePhoto", photoFile);
      }

      const res = await apiClient.put<ApiResponse<PickupPersonResponse>>(
        `/api/children/${childId}/pickup-persons/${personId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: childPickupPersonsQueryKey(variables.childId),
      });
    },
  });
}

export interface DeletePickupPersonParams {
  childId: string;
  personId: string;
}

/**
 * Xóa người đón dự phòng (FR-PICKUP-03, AC-PICKUP-08, DELETE)
 * Chỉ xóa được người đón dự phòng; backend trả 409 nếu cố xóa người đón chính.
 */
export function useDeletePickupPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, personId }: DeletePickupPersonParams) => {
      const res = await apiClient.delete<ApiResponse<object | null>>(
        `/api/children/${childId}/pickup-persons/${personId}`
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: childPickupPersonsQueryKey(variables.childId),
      });
    },
  });
}
