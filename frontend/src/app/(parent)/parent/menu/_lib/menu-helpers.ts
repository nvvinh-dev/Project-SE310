import {
  DAY_OF_WEEK_LABELS,
  MENU_DAYS_OF_WEEK,
  type MenuDayOfWeek,
  type MenuEntryResponse,
} from "@/types/menu";

export interface DailyMenuDisplayItem {
  dayOfWeek: MenuDayOfWeek;
  dayLabel: string;
  description: string | null;
  hasMenu: boolean;
}

/**
 * Xây dựng lịch thực đơn cho 7 ngày trong tuần từ thứ Hai đến Chủ nhật (SCR-PAR-07).
 * - Duyệt qua 7 ngày (1..7).
 * - Ngày có trong entries: hasMenu = true, giữ nguyên mô tả.
 * - Ngày thiếu trong entries: hasMenu = false, description = null ("Chưa có thực đơn").
 */
export const buildWeeklySchedule = (
  entries: MenuEntryResponse[] = []
): DailyMenuDisplayItem[] => {
  const schedule: DailyMenuDisplayItem[] = [];

  for (const dayOfWeek of MENU_DAYS_OF_WEEK) {
    const entry = entries.find((e) => e.dayOfWeek === dayOfWeek);
    const description = entry ? entry.description.trim() : null;

    schedule.push({
      dayOfWeek,
      dayLabel: DAY_OF_WEEK_LABELS[dayOfWeek],
      description,
      hasMenu: Boolean(description && description.length > 0),
    });
  }

  return schedule;
};
