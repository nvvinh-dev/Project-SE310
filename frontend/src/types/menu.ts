// Phản chiếu DTO của backend trong backend/NhaTre.Application/DTOs/Menu/
// FR-MENU-01, FR-MENU-02, BR-MENU-01, BR-MENU-02

/**
 * Một mục thực đơn theo ngày trong tuần.
 * DayOfWeek theo chuẩn ISO 8601: 1 = thứ Hai ... 7 = Chủ nhật.
 */
export interface MenuEntryResponse {
  dayOfWeek: number;
  description: string;
}

/**
 * Thực đơn của một tuần tính từ ngày thứ Hai (weekStartDate).
 */
export interface WeeklyMenuResponse {
  id: string;
  weekStartDate: string; // yyyy-MM-dd
  entries: MenuEntryResponse[];
}

/**
 * Bảng nhãn thứ trong tuần theo tiếng Việt (ui-screens.md SCR-PAR-07 và SCR-ACC-06).
 */
export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
  7: "Chủ nhật",
};
