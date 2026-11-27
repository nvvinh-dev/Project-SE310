// FR-ATT-04: theo dõi trẻ vắng không phép (D39 mục 20). Giáo viên ghi kết quả liên hệ người đón,
// Ban giám hiệu (Admin) xem danh sách cần xử lý của hôm nay

// Hai kết quả liên hệ, khớp hằng số AbsenceFollowUpOutcomes của backend
export type AbsenceFollowUpOutcome = "Reached" | "Unreachable";

export const ABSENCE_FOLLOW_UP_OUTCOME_LABELS: Record<AbsenceFollowUpOutcome, string> = {
  Reached: "Liên lạc được",
  Unreachable: "Không liên lạc được",
};

// Một lần liên hệ đã ghi. Người ghi và thời điểm do server đặt; không sửa, không xóa (BR-ATTENDANCE-07)
export interface AbsenceFollowUpResponse {
  outcome: AbsenceFollowUpOutcome;
  note: string | null;
  recordedByTeacherName: string;
  recordedAtUtc: string;
}

// Một dòng trong danh sách cần xử lý của Admin: chỉ họ tên trẻ, lớp và các lần liên hệ theo thứ tự ghi,
// không có id trẻ hay người đón (BR-ATTENDANCE-08, D40 mục 3, AC-ATT-14)
export interface AbsenceEscalationResponse {
  childFullName: string;
  className: string;
  followUps: AbsenceFollowUpResponse[];
}

// Người đón của trẻ vắng không phép, chỉ đủ để giáo viên gọi điện: không có CCCD hay ảnh khuôn mặt
// (AC-ATT-12, D45). priority 1 = người đón chính, 2 = người dự phòng (D24); backend xếp người chính trước
export interface AbsencePickupContactResponse {
  priority: number;
  fullName: string;
  relationship: string;
  phoneNumber: string;
}

// Một trẻ vắng không phép hôm nay trong danh sách cần liên hệ của giáo viên (SCR-TCH-07). Các lần liên hệ
// theo thứ tự ghi
export interface AbsenceTodayResponse {
  attendanceId: string;
  childId: string;
  childFullName: string;
  classId: string;
  className: string;
  pickupPersons: AbsencePickupContactResponse[];
  followUps: AbsenceFollowUpResponse[];
}

// Body của POST /api/attendances/{id}/follow-ups. Reached thì bắt buộc ghi chú; ghi chú tối đa 500 ký tự
export interface CreateAbsenceFollowUpRequest {
  outcome: AbsenceFollowUpOutcome;
  note: string | null;
}
