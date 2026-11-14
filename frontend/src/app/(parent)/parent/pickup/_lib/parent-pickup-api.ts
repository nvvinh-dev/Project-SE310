"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  CreatePickupPersonRequest,
  PickupPersonRequest,
  PickupPersonResponse,
} from "@/types/pickup";
import {
  MY_CHILDREN_QUERY_KEY,
  useMyChildren,
} from "../../attendance/_lib/parent-attendance-api";

// Dùng lại query danh sách con của màn hình điểm danh phụ huynh (frontend-conventions.md §1)
export { MY_CHILDREN_QUERY_KEY, useMyChildren };

export const childPickupPersonsQueryKey = (childId: string) =>
  ["children", childId, "pickup-persons"] as const;

/**
 * Người đón đã đăng ký của con (FR-PICKUP-03, UC-PICKUP-02, AC-PICKUP-03)
 * GET /api/children/{childId}/pickup-persons
 * facePhotoUrl là URL ký hết hạn sau 60 phút (D53).
 */
export function useChildPickupPersons(childId: string | null | undefined) {
  return useQuery({
    queryKey: childId
      ? childPickupPersonsQueryKey(childId)
      : ["children", "empty", "pickup-persons"],
    queryFn: async () => {
      if (!childId) return [];
      const res = await apiClient.get<ApiResponse<PickupPersonResponse[]>>(
        `/api/children/${childId}/pickup-persons`
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(childId),
    retry: false, // 404 (con vừa bị gỡ liên kết) là kết quả bình thường (frontend-conventions.md §3.3)
  });
}

// Multipart theo SCR-PAR-04 Hành vi 3: 4 thông tin, consentConfirmed và ảnh ở trường facePhoto
function toPickupPersonFormData(body: PickupPersonRequest, facePhoto: File | null): FormData {
  const formData = new FormData();
  formData.append("fullName", body.fullName);
  formData.append("relationship", body.relationship);
  formData.append("phoneNumber", body.phoneNumber);
  formData.append("citizenIdNumber", body.citizenIdNumber);
  formData.append("consentConfirmed", String(body.consentConfirmed));
  if (facePhoto) formData.append("facePhoto", facePhoto);
  return formData;
}

// apiClient mặc định application/json, khi đó Axios đổi FormData thành JSON và mất ảnh (SCR-PAR-04)
const MULTIPART_CONFIG = { headers: { "Content-Type": "multipart/form-data" } };

// Làm mới danh sách người đón kể cả khi lỗi: 409 thường do người đón vừa bị đổi ở máy khác
// (frontend-conventions.md §3.2). Lỗi thì làm mới cả danh sách con: 404 có thể do con vừa bị gỡ
// liên kết (ui-screens.md §10); làm cùng một việc cho mọi lỗi, không rẽ nhánh theo mã (§5)
function usePickupPersonMutation<TVariables extends { childId: string }, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSettled: (_data, error, variables) => {
      void queryClient.invalidateQueries({
        queryKey: childPickupPersonsQueryKey(variables.childId),
      });
      if (error) {
        void queryClient.invalidateQueries({ queryKey: MY_CHILDREN_QUERY_KEY });
      }
    },
  });
}

export interface CreatePickupPersonVariables {
  childId: string;
  body: CreatePickupPersonRequest;
  facePhoto: File;
}

// POST /api/children/{childId}/pickup-persons (FR-PICKUP-03, AC-PICKUP-11)
export function useCreatePickupPerson() {
  return usePickupPersonMutation(
    async ({ childId, body, facePhoto }: CreatePickupPersonVariables) => {
      const formData = toPickupPersonFormData(body, facePhoto);
      formData.append("priority", String(body.priority));

      const res = await apiClient.post<ApiResponse<PickupPersonResponse>>(
        `/api/children/${childId}/pickup-persons`,
        formData,
        MULTIPART_CONFIG
      );
      return res.data.data as PickupPersonResponse;
    }
  );
}

export interface UpdatePickupPersonVariables {
  childId: string;
  personId: string;
  body: PickupPersonRequest;
  // null: giữ ảnh cũ (SCR-PAR-04 Hành vi 1)
  facePhoto: File | null;
}

// PUT /api/children/{childId}/pickup-persons/{id}; không đổi được priority
export function useUpdatePickupPerson() {
  return usePickupPersonMutation(
    async ({ childId, personId, body, facePhoto }: UpdatePickupPersonVariables) => {
      const res = await apiClient.put<ApiResponse<PickupPersonResponse>>(
        `/api/children/${childId}/pickup-persons/${personId}`,
        toPickupPersonFormData(body, facePhoto),
        MULTIPART_CONFIG
      );
      return res.data.data as PickupPersonResponse;
    }
  );
}

export interface DeletePickupPersonVariables {
  childId: string;
  personId: string;
}

// DELETE chỉ dùng cho người dự phòng; người đón chính bị backend trả 409 (AC-PICKUP-08)
export function useDeletePickupPerson() {
  return usePickupPersonMutation(async ({ childId, personId }: DeletePickupPersonVariables) => {
    await apiClient.delete<ApiResponse<null>>(
      `/api/children/${childId}/pickup-persons/${personId}`
    );
  });
}
