import {
  MENU_DAYS_OF_WEEK,
  type MenuDayOfWeek,
  type MenuEntryRequest,
  type WeeklyMenuResponse,
} from "@/types/menu";

// Mỗi ô là mô tả của một ngày, chỉ số 0 ứng với thứ Hai (dayOfWeek = chỉ số + 1). Ô trống là ngày không có
// thực đơn
export interface WeeklyMenuFormValues {
  descriptions: string[];
}

export const MAX_MENU_DESCRIPTION_LENGTH = 1000;

// Tên ngày trong câu thông báo, viết đúng như MenuRuleExtensions của backend ("thứ Ba", không phải "Thứ Ba")
const DAY_NAMES_IN_MESSAGE: Record<MenuDayOfWeek, string> = {
  1: "thứ Hai",
  2: "thứ Ba",
  3: "thứ Tư",
  4: "thứ Năm",
  5: "thứ Sáu",
  6: "thứ Bảy",
  7: "Chủ nhật",
};

// Thực đơn có 1–7 ngày và không có cách xóa trắng, nên chặn Lưu khi mọi ô đều trống (SCR-ACC-06, Hành vi 4).
// Cùng câu với backend
export const EMPTY_MENU_MESSAGE = "Thực đơn tuần phải có ít nhất một ngày.";

type FieldRules = { validate: Record<string, (value: string) => true | string> };

// Khớp MenuRuleExtensions của backend: đo sau khi trim vì backend lưu bản đã trim. Ô trống hợp lệ: ngày đó
// không gửi lên
export function menuDescriptionRules(dayOfWeek: MenuDayOfWeek): FieldRules {
  return {
    validate: {
      maxLength: (value) =>
        value.trim().length <= MAX_MENU_DESCRIPTION_LENGTH ||
        `Thực đơn ${DAY_NAMES_IN_MESSAGE[dayOfWeek]} không được dài quá ${MAX_MENU_DESCRIPTION_LENGTH} ký tự.`,
    },
  };
}

// Ngày không có trong entries thì để ô trống (SCR-ACC-06, Hành vi 1)
export function toWeeklyMenuFormValues(menu: WeeklyMenuResponse | null): WeeklyMenuFormValues {
  return {
    descriptions: MENU_DAYS_OF_WEEK.map(
      (dayOfWeek) => menu?.entries.find((entry) => entry.dayOfWeek === dayOfWeek)?.description ?? ""
    ),
  };
}

// Chỉ gửi những ngày còn mô tả, đã trim (SCR-ACC-06, Hành vi 2 và 3)
export function toMenuEntries(values: WeeklyMenuFormValues): MenuEntryRequest[] {
  return MENU_DAYS_OF_WEEK.map((dayOfWeek, index) => ({
    dayOfWeek,
    description: (values.descriptions[index] ?? "").trim(),
  })).filter((entry) => entry.description !== "");
}
