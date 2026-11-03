import { DAY_OF_WEEK_LABELS, type MenuEntryResponse } from "@/types/menu";

export interface DailyMenuDisplayItem {
  dayOfWeek: number;
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

  for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
    const entry = entries.find((e) => e.dayOfWeek === dayOfWeek);
    const description = entry ? entry.description.trim() : null;

    schedule.push({
      dayOfWeek,
      dayLabel: DAY_OF_WEEK_LABELS[dayOfWeek] ?? `Thứ ${dayOfWeek}`,
      description,
      hasMenu: Boolean(description && description.length > 0),
    });
  }

  return schedule;
};
