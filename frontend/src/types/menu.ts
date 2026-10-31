// Phản chiếu DTO thực đơn tuần (NhaTre.Application/DTOs/Menu). Kế toán và Phụ huynh nhận cùng một dạng vì
// thực đơn là dữ liệu toàn trường (BR-MENU-02)

// Ngày trong tuần theo ISO 8601: 1 = thứ Hai ... 7 = Chủ nhật
export type MenuDayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const MENU_DAYS_OF_WEEK: readonly MenuDayOfWeek[] = [1, 2, 3, 4, 5, 6, 7];

export const MENU_DAY_LABELS: Record<MenuDayOfWeek, string> = {
  1: "Thứ Hai",
  2: "Thứ Ba",
  3: "Thứ Tư",
  4: "Thứ Năm",
  5: "Thứ Sáu",
  6: "Thứ Bảy",
  7: "Chủ nhật",
};

export interface MenuEntryResponse {
  dayOfWeek: MenuDayOfWeek;
  description: string;
}

// weekStartDate là ngày thứ Hai, dạng yyyy-MM-dd. Entries xếp theo ngày, chỉ gồm những ngày có thực đơn
export interface WeeklyMenuResponse {
  id: string;
  weekStartDate: string;
  entries: MenuEntryResponse[];
}

export interface MenuEntryRequest {
  dayOfWeek: MenuDayOfWeek;
  description: string;
}

// Tạo thực đơn cho tuần chưa có: entries chỉ gồm những ngày có mô tả, 1–7 ngày
export interface CreateWeeklyMenuRequest {
  weekStartDate: string;
  entries: MenuEntryRequest[];
}

// Sửa gửi lại đủ các ngày còn mô tả: ngày không gửi bị gỡ khỏi thực đơn. Không đổi được tuần
export interface UpdateWeeklyMenuRequest {
  entries: MenuEntryRequest[];
}
