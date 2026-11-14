// Quy chuẩn và hằng số kiểm tra thông tin người đón theo SCR-PAR-04, FR-PICKUP-03, D24, D39 mục 5
// và AC-PICKUP-03, AC-PICKUP-10, AC-PICKUP-11, AC-PICKUP-15.

export const MAX_FULL_NAME_LENGTH = 100;
export const MAX_RELATIONSHIP_LENGTH = 50;
export const PHONE_REGEX = /^0\d{9}$/;
export const CITIZEN_ID_REGEX = /^\d{12}$/;

// Ảnh khuôn mặt đúng 1 ảnh JPEG/PNG dung lượng ≤ 5 MB (AC-PICKUP-10, D39 mục 5)
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png"];

// Văn bản cam kết đồng ý cố định theo D24 và ui-screens.md SCR-PAR-04
export const CONSENT_CONFIRMATION_TEXT =
  "Tôi xác nhận người được đăng ký (hoặc chính tôi, nếu tôi tự đăng ký) đồng ý cung cấp họ tên, số điện thoại, số CCCD và ảnh khuôn mặt để nhà trường xác minh khi đón trẻ. Thông tin chỉ phụ huynh của trẻ và giáo viên phụ trách lớp của trẻ xem được, và bị xóa khi người này không còn được đăng ký.";

export interface PickupPersonFormValues {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  citizenIdNumber: string;
  photoFile: File | null;
  consentConfirmed: boolean;
}

export interface PickupPersonFormErrors {
  fullName?: string;
  relationship?: string;
  phoneNumber?: string;
  citizenIdNumber?: string;
  photoFile?: string;
  consentConfirmed?: string;
}

/**
 * Kiểm tra tính hợp lệ của form thông tin người đón ở client.
 * @param values Dữ liệu form nhập vào.
 * @param isEditing Đang sửa (không bắt buộc chọn lại ảnh) hay thêm mới (ảnh bắt buộc).
 * @param existingOtherCitizenId Số CCCD của người còn lại (để cảnh báo trùng CCCD sớm nếu có).
 */
export function validatePickupPersonForm(
  values: PickupPersonFormValues,
  isEditing: boolean,
  existingOtherCitizenId?: string
): PickupPersonFormErrors {
  const errors: PickupPersonFormErrors = {};

  const trimmedName = values.fullName.trim();
  if (!trimmedName) {
    errors.fullName = "Vui lòng nhập họ tên người đón.";
  } else if (trimmedName.length > MAX_FULL_NAME_LENGTH) {
    errors.fullName = `Họ tên không được vượt quá ${MAX_FULL_NAME_LENGTH} ký tự.`;
  }

  const trimmedRelationship = values.relationship.trim();
  if (!trimmedRelationship) {
    errors.relationship = "Vui lòng nhập mối liên hệ với trẻ (ví dụ: Mẹ, Bố, Ông, Bà...).";
  } else if (trimmedRelationship.length > MAX_RELATIONSHIP_LENGTH) {
    errors.relationship = `Mối liên hệ không được vượt quá ${MAX_RELATIONSHIP_LENGTH} ký tự.`;
  }

  const trimmedPhone = values.phoneNumber.trim();
  if (!trimmedPhone) {
    errors.phoneNumber = "Vui lòng nhập số điện thoại.";
  } else if (!PHONE_REGEX.test(trimmedPhone)) {
    errors.phoneNumber = "Số điện thoại phải đúng 10 chữ số và bắt đầu bằng số 0.";
  }

  const trimmedCitizenId = values.citizenIdNumber.trim();
  if (!trimmedCitizenId) {
    errors.citizenIdNumber = "Vui lòng nhập số CCCD.";
  } else if (!CITIZEN_ID_REGEX.test(trimmedCitizenId)) {
    errors.citizenIdNumber = "Số CCCD phải đúng 12 chữ số.";
  } else if (existingOtherCitizenId && trimmedCitizenId === existingOtherCitizenId.trim()) {
    errors.citizenIdNumber = "Người đón chính và người đón dự phòng không được trùng số CCCD.";
  }

  // Ảnh khuôn mặt
  if (!isEditing && !values.photoFile) {
    errors.photoFile = "Vui lòng chọn 1 ảnh khuôn mặt của người đón.";
  } else if (values.photoFile) {
    if (!ALLOWED_PHOTO_MIME_TYPES.includes(values.photoFile.type)) {
      errors.photoFile = "Chỉ chấp nhận ảnh định dạng JPEG hoặc PNG.";
    } else if (values.photoFile.size > MAX_PHOTO_SIZE_BYTES) {
      errors.photoFile = "Dung lượng ảnh không được vượt quá 5 MB.";
    }
  }

  // Ô xác nhận đồng ý (AC-PICKUP-15, D24)
  if (!values.consentConfirmed) {
    errors.consentConfirmed = "Vui lòng đọc và đánh dấu xác nhận đồng ý để tiếp tục.";
  }

  return errors;
}
