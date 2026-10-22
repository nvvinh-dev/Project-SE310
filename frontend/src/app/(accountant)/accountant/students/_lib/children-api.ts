"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { ChildProfileRequest, ChildResponse, GuardianResponse, LinkGuardianRequest } from "@/types/child";

export const CHILDREN_QUERY_KEY = ["children"] as const;
export const PARENT_ACCOUNTS_QUERY_KEY = ["parent-accounts"] as const;

export function childGuardiansQueryKey(childId: string) {
  return [...CHILDREN_QUERY_KEY, childId, "guardians"] as const;
}

function parentAccountsQueryKey(search: string) {
  return [...PARENT_ACCOUNTS_QUERY_KEY, { search }] as const;
}

// Thao tác ghi thành công luôn trả bản ghi sau khi đổi; thiếu data thì coi như lỗi
function unwrap<T>(res: { data: ApiResponse<T> }): T {
  const data = res.data.data;
  if (data === null) throw new Error("Phản hồi không có dữ liệu.");
  return data;
}

// Backend trả danh sách đã sắp xếp theo họ tên
export function useChildren() {
  return useQuery({
    queryKey: CHILDREN_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChildResponse[]>>("/api/children");
      return res.data.data ?? [];
    },
  });
}

// Tạo hồ sơ xong thì tải lại danh sách để trẻ mới vào đúng thứ tự họ tên
export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: ChildProfileRequest) =>
      unwrap(await apiClient.post<ApiResponse<ChildResponse>>("/api/children", body)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY }),
  });
}

// Thành công thì thay ngay dòng của trẻ bằng bản ghi API trả về. Tải lại danh sách cả khi lỗi: 404 nghĩa
// là danh sách đang hiện đã cũ
export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: ChildProfileRequest }) =>
      unwrap(await apiClient.put<ApiResponse<ChildResponse>>(`/api/children/${id}`, body)),
    onSuccess: (updated) =>
      queryClient.setQueryData<ChildResponse[]>(CHILDREN_QUERY_KEY, (children) =>
        children?.map((child) => (child.id === updated.id ? updated : child))
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY }),
  });
}

// Gồm cả tài khoản đã bị vô hiệu hóa hay đổi vai trò, để gỡ được liên kết sai (D39 mục 16)
export function useChildGuardians(childId: string) {
  return useQuery({
    queryKey: childGuardiansQueryKey(childId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<GuardianResponse[]>>(`/api/children/${childId}/guardians`);
      return res.data.data ?? [];
    },
  });
}

// Chỉ tìm khi đã gõ: không tải sẵn mọi tài khoản Phụ huynh (D45). Backend chỉ trả tài khoản Phụ huynh
// đang hoạt động, khớp họ tên hoặc email. Giữ kết quả cũ trong lúc tìm từ khóa mới để danh sách không nháy
export function useParentAccounts(search: string) {
  return useQuery({
    queryKey: parentAccountsQueryKey(search),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<GuardianResponse[]>>("/api/parent-accounts", {
        params: { search },
      });
      return res.data.data ?? [];
    },
    enabled: search !== "",
    placeholderData: keepPreviousData,
  });
}

// Thành công thì thêm ngay phụ huynh vào danh sách đã liên kết. Tải lại danh sách đó cả khi lỗi (409 do
// Kế toán khác vừa liên kết). Lỗi thì tải lại cả kết quả tìm, vì tài khoản được chọn có thể vừa bị vô
// hiệu hóa hay đổi vai trò (400)
export function useLinkGuardian(childId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: LinkGuardianRequest) =>
      unwrap(await apiClient.post<ApiResponse<GuardianResponse>>(`/api/children/${childId}/guardians`, body)),
    onSuccess: (linked) =>
      queryClient.setQueryData<GuardianResponse[]>(childGuardiansQueryKey(childId), (guardians) =>
        guardians && !guardians.some((guardian) => guardian.userId === linked.userId)
          ? [...guardians, linked]
          : guardians
      ),
    onError: () => queryClient.invalidateQueries({ queryKey: PARENT_ACCOUNTS_QUERY_KEY }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: childGuardiansQueryKey(childId) }),
  });
}

// Ngoại lệ Xóa của D40 mục 1: chỉ xóa liên kết, dữ liệu của trẻ giữ nguyên. Tải lại danh sách cả khi lỗi
// (404 do liên kết vừa bị gỡ ở máy khác)
export function useUnlinkGuardian(childId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guardianUserId: string) =>
      unwrap(
        await apiClient.delete<ApiResponse<GuardianResponse>>(`/api/children/${childId}/guardians/${guardianUserId}`)
      ),
    onSuccess: (unlinked) =>
      queryClient.setQueryData<GuardianResponse[]>(childGuardiansQueryKey(childId), (guardians) =>
        guardians?.filter((guardian) => guardian.userId !== unlinked.userId)
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: childGuardiansQueryKey(childId) }),
  });
}
