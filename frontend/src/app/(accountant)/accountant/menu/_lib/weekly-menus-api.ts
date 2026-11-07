"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, toApiError } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { CreateWeeklyMenuRequest, UpdateWeeklyMenuRequest, WeeklyMenuResponse } from "@/types/menu";

export const WEEKLY_MENUS_QUERY_KEY = ["weekly-menus"] as const;

export function weeklyMenuQueryKey(weekStartDate: string) {
  return [...WEEKLY_MENUS_QUERY_KEY, { weekStartDate }] as const;
}

// Trả null khi tuần chưa có thực đơn: backend trả 404 và không tạo bản ghi rỗng (UC-MENU-02 E1). Với màn hình
// này đó là kết quả bình thường, các ô để trống và Lưu sẽ tạo mới (ui-screens.md SCR-ACC-06, Hành vi 1), nên
// không đưa thành lỗi. Lỗi khác vẫn ném ra để hiện message của backend
export function useWeeklyMenu(weekStartDate: string) {
  return useQuery({
    queryKey: weeklyMenuQueryKey(weekStartDate),
    queryFn: async () => {
      try {
        const res = await apiClient.get<ApiResponse<WeeklyMenuResponse>>("/api/weekly-menus", {
          params: { weekStartDate },
        });
        return res.data.data;
      } catch (err) {
        if (toApiError(err).status === 404) return null;
        throw err;
      }
    },
  });
}

// Ghi xong thì đặt ngay thực đơn backend trả về vào cache để form hiện bản đã lưu. Làm mới cả khi lỗi: 409 nghĩa
// là Kế toán khác vừa tạo thực đơn cho tuần này, phải tải lại để chuyển sang sửa (SCR-ACC-06, Hành vi 2)
function useWeeklyMenuMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<WeeklyMenuResponse>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (menu) => {
      queryClient.setQueryData(weeklyMenuQueryKey(menu.weekStartDate), menu);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: WEEKLY_MENUS_QUERY_KEY });
    },
  });
}

function unwrapMenu(res: { data: ApiResponse<WeeklyMenuResponse> }): WeeklyMenuResponse {
  const menu = res.data.data;
  if (menu === null) throw new Error("Phản hồi không có dữ liệu.");
  return menu;
}

// FR-MENU-01: tuần chưa có thực đơn → 201; tuần đã có → 409
export function useCreateWeeklyMenu() {
  return useWeeklyMenuMutation(async (body: CreateWeeklyMenuRequest) =>
    unwrapMenu(await apiClient.post<ApiResponse<WeeklyMenuResponse>>("/api/weekly-menus", body))
  );
}

// FR-MENU-01: gửi lại đủ các ngày còn mô tả, ngày không gửi bị gỡ khỏi thực đơn. Hai Kế toán sửa cùng lúc thì
// lần sau ghi đè lần trước (D39 mục 13)
export function useUpdateWeeklyMenu() {
  return useWeeklyMenuMutation(async ({ id, body }: { id: string; body: UpdateWeeklyMenuRequest }) =>
    unwrapMenu(await apiClient.put<ApiResponse<WeeklyMenuResponse>>(`/api/weekly-menus/${id}`, body))
  );
}
