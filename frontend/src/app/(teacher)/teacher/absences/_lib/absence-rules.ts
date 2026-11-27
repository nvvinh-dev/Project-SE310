import { ABSENCE_FOLLOW_UP_OUTCOME_LABELS, type AbsenceTodayResponse } from "@/types/absence";

// Kết quả sau cùng của một trẻ: theo lần liên hệ ghi sau cùng, hoặc chưa liên hệ lần nào (D39 mục 20)
export type AbsenceContactStatus = "NotContacted" | "Unreachable" | "Reached";

export const ABSENCE_CONTACT_STATUS_LABELS: Record<AbsenceContactStatus, string> = {
  NotContacted: "Chưa liên hệ",
  ...ABSENCE_FOLLOW_UP_OUTCOME_LABELS,
};

export const NOTE_MAX_LENGTH = 500;

export function getContactStatus(absence: AbsenceTodayResponse): AbsenceContactStatus {
  const last = absence.followUps.at(-1);
  return last ? last.outcome : "NotContacted";
}

// Trẻ chưa liên hệ xếp trước, còn lại giữ thứ tự backend trả (SCR-TCH-07, Hành vi 1)
export function sortNotContactedFirst(absences: AbsenceTodayResponse[]): AbsenceTodayResponse[] {
  return [
    ...absences.filter((absence) => absence.followUps.length === 0),
    ...absences.filter((absence) => absence.followUps.length > 0),
  ];
}

export function countNotContacted(absences: AbsenceTodayResponse[] | undefined): number {
  return absences?.filter((absence) => absence.followUps.length === 0).length ?? 0;
}

export function getPickupPriorityLabel(priority: number): string {
  return priority === 1 ? "Người đón chính" : "Người dự phòng";
}

// Số điện thoại hiển thị có khoảng trắng; link tel: chỉ giữ chữ số và dấu +
export function toTelHref(phoneNumber: string): string {
  return `tel:${phoneNumber.replace(/[^\d+]/g, "")}`;
}
