"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  ChangeRoleRequest,
  CreateUserRequest,
  ResetPasswordRequest,
  UpdateUserRequest,
  UserResponse,
} from "@/types/user";

export const USERS_QUERY_KEY = ["users"] as const;

// Backend trả danh sách đã sắp xếp tài khoản mới tạo lên đầu
export function useUsers() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<UserResponse[]>>("/api/users");
      return res.data.data ?? [];
    },
  });
}

// Mọi thao tác ghi đều trả về tài khoản sau khi đổi. Xong thì tải lại danh sách, kể cả khi lỗi:
// 404/409 thường do Admin khác vừa đổi tài khoản đó, danh sách đang hiện đã cũ
function useUserMutation<TVariables>(request: (variables: TVariables) => Promise<UserResponse>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: request,
    onSettled: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

async function unwrap(promise: Promise<{ data: ApiResponse<UserResponse> }>): Promise<UserResponse> {
  const res = await promise;
  return res.data.data as UserResponse;
}

export function useCreateUser() {
  return useUserMutation((body: CreateUserRequest) =>
    unwrap(apiClient.post<ApiResponse<UserResponse>>("/api/users", body))
  );
}

export function useUpdateUser() {
  return useUserMutation(({ id, body }: { id: string; body: UpdateUserRequest }) =>
    unwrap(apiClient.put<ApiResponse<UserResponse>>(`/api/users/${id}`, body))
  );
}

export function useChangeRole() {
  return useUserMutation(({ id, body }: { id: string; body: ChangeRoleRequest }) =>
    unwrap(apiClient.post<ApiResponse<UserResponse>>(`/api/users/${id}/change-role`, body))
  );
}

export function useResetPassword() {
  return useUserMutation(({ id, body }: { id: string; body: ResetPasswordRequest }) =>
    unwrap(apiClient.post<ApiResponse<UserResponse>>(`/api/users/${id}/reset-password`, body))
  );
}

export function useSetUserActive() {
  return useUserMutation(({ id, active }: { id: string; active: boolean }) =>
    unwrap(apiClient.post<ApiResponse<UserResponse>>(`/api/users/${id}/${active ? "activate" : "deactivate"}`))
  );
}
