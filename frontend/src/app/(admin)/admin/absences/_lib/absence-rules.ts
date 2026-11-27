import { ABSENCE_FOLLOW_UP_OUTCOME_LABELS, type AbsenceEscalationResponse } from "@/types/absence";

// Trạng thái của một trẻ trong danh sách cần xử lý: kết quả lần liên hệ sau cùng, hoặc chưa liên hệ
// lần nào (D39 mục 20). Backend chỉ trả trẻ có lần sau cùng là Unreachable, hoặc chưa liên hệ sau 10:00
export type EscalationStatus = "Unreachable" | "Reached" | "NotContacted";

export const ESCALATION_STATUS_LABELS: Record<EscalationStatus, string> = {
  ...ABSENCE_FOLLOW_UP_OUTCOME_LABELS,
  NotContacted: "Chưa liên hệ",
};

export function getEscalationStatus(escalation: AbsenceEscalationResponse): EscalationStatus {
  const last = escalation.followUps.at(-1);
  return last ? last.outcome : "NotContacted";
}
