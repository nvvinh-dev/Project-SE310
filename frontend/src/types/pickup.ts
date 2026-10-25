export type PickupMethod = "Primary" | "Backup" | "PhoneConfirmed";

// D45: bản ghi đón về chỉ trả cách đón, họ tên đã chép lúc đón và thời điểm đón;
// không kèm số điện thoại hay số CCCD của người đón.
// confirmedByName chỉ có khi pickupMethod là PhoneConfirmed
export interface PickupResponse {
  id: string;
  attendanceId: string;
  childId: string;
  childFullName: string;
  pickupTimeUtc: string; // ISO string
  pickupMethod: PickupMethod;
  pickerFullName: string;
  confirmedByName: string | null;
}

// D45: giáo viên đối chiếu người đón chỉ nhận họ tên, mối liên hệ, số điện thoại, số CCCD
// và URL ký của ảnh khuôn mặt.
// priority: 1 = chính, 2 = dự phòng (PickupPersonPriorities).
// facePhotoUrl hết hạn sau 60 phút (D53), hết hạn thì gọi lại API để nhận URL mới.
export interface PickupPersonResponse {
  id: string;
  priority: 1 | 2;
  fullName: string;
  relationship: string;
  phoneNumber: string;
  citizenIdNumber: string;
  facePhotoUrl: string;
}

// Request ghi nhận đón về (FR-PICKUP-01, AC-PICKUP-01, AC-PICKUP-04)
export interface CreatePickupRequest {
  childId: string;
  pickupMethod: PickupMethod;
  pickupPersonId: string;
  pickerFullName?: string | null;
}

// Nhãn tiếng Việt của cách đón theo ui-screens.md §4.4
export const PICKUP_METHOD_LABELS: Record<PickupMethod, string> = {
  Primary: "Người đón chính",
  Backup: "Người dự phòng",
  PhoneConfirmed: "Người khác, đã gọi xác nhận",
};
