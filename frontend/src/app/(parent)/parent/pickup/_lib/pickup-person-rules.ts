// Quy tắc kiểm tra form người đón (SCR-PAR-04, FR-PICKUP-03, D24, D39 mục 5).
// Cùng giới hạn và cùng câu thông báo với PickupPersonRequestValidator, FacePhotoValidator và
// PickupController.ValidatePickupPersonAsync của backend (frontend-conventions.md §4, khuôn user-rules.ts).
// Họ tên và mối liên hệ đo sau khi trim vì backend lưu bản đã trim (ui-screens.md §4.3)

type FieldRules<T> = { validate: Record<string, (value: T) => true | string> };

const PHONE_NUMBER_REGEX = /^0[0-9]{9}$/;
const CITIZEN_ID_REGEX = /^[0-9]{12}$/;

// D39 mục 5: ảnh khuôn mặt đúng 1 ảnh JPEG/PNG, tối đa 5 MB
const MAX_FACE_PHOTO_BYTES = 5 * 1024 * 1024;
const FACE_PHOTO_CONTENT_TYPES = ["image/jpeg", "image/png"];
const FACE_PHOTO_EXTENSION_REGEX = /\.(jpe?g|png)$/i;
export const FACE_PHOTO_ACCEPT = "image/jpeg,image/png";

// Câu xác nhận đồng ý giữ nguyên văn D24 (ui-screens.md SCR-PAR-04 Hành vi 2)
export const CONSENT_CONFIRMATION_TEXT =
  "Tôi xác nhận người được đăng ký (hoặc chính tôi, nếu tôi tự đăng ký) đồng ý cung cấp họ tên, số điện thoại, số CCCD và ảnh khuôn mặt để nhà trường xác minh khi đón trẻ. Thông tin chỉ phụ huynh của trẻ và giáo viên phụ trách lớp của trẻ xem được, và bị xóa khi người này không còn được đăng ký.";

export const pickupFullNameRules: FieldRules<string> = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Họ tên người đón không được để trống.",
    maxLength: (value) =>
      value.trim().length <= 100 || "Họ tên người đón không được dài quá 100 ký tự.",
  },
};

export const relationshipRules: FieldRules<string> = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Mối liên hệ với trẻ không được để trống.",
    maxLength: (value) =>
      value.trim().length <= 50 || "Mối liên hệ với trẻ không được dài quá 50 ký tự.",
  },
};

export const phoneNumberRules: FieldRules<string> = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Số điện thoại không được để trống.",
    format: (value) =>
      PHONE_NUMBER_REGEX.test(value.trim()) ||
      "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0.",
  },
};

export const citizenIdNumberRules: FieldRules<string> = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Số CCCD không được để trống.",
    format: (value) =>
      CITIZEN_ID_REGEX.test(value.trim()) || "Số CCCD phải gồm đúng 12 chữ số.",
  },
};

// BR-PICKUP-10, AC-PICKUP-15: mỗi lần lưu đều phải đánh dấu
export const consentConfirmedRules: FieldRules<boolean> = {
  validate: {
    confirmed: (value) =>
      value === true ||
      "Cần xác nhận người được đăng ký đồng ý cung cấp thông tin để nhà trường xác minh khi đón trẻ.",
  },
};

// Thêm mới: bắt buộc đúng 1 ảnh. Sửa: không chọn ảnh nghĩa là giữ ảnh cũ (SCR-PAR-04 Hành vi 1)
export function facePhotoRules(isRequired: boolean): FieldRules<FileList | null | undefined> {
  return {
    validate: {
      count: (files) => {
        const count = files?.length ?? 0;
        if (count > 1) return "Chỉ gửi đúng 1 ảnh khuôn mặt cho mỗi người đón.";
        if (count === 0 && isRequired) return "Cần 1 ảnh khuôn mặt của người đón.";
        return true;
      },
      contentType: (files) => {
        const file = files?.[0];
        return (
          !file ||
          FACE_PHOTO_CONTENT_TYPES.includes(file.type) ||
          "Ảnh khuôn mặt chỉ nhận định dạng JPEG hoặc PNG."
        );
      },
      extension: (files) => {
        const file = files?.[0];
        return (
          !file ||
          FACE_PHOTO_EXTENSION_REGEX.test(file.name) ||
          "Tên file ảnh khuôn mặt phải có đuôi .jpg, .jpeg hoặc .png."
        );
      },
      size: (files) => {
        const file = files?.[0];
        if (!file) return true;
        if (file.size <= 0) return "Ảnh khuôn mặt không được rỗng.";
        return file.size <= MAX_FACE_PHOTO_BYTES || "Ảnh khuôn mặt không được lớn hơn 5 MB.";
      },
    },
  };
}
