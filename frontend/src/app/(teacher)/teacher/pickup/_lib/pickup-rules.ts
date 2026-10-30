// Quy tắc kiểm tra ô nhập cho form ghi nhận đón về xác nhận qua điện thoại
// Khớp đúng câu thông báo của validator backend trong CreatePickupRequestValidator.cs (AC-PICKUP-04, D24, ui-screens.md §4.3)

export const phoneConfirmedPickupRules = {
  pickerFullName: {
    required: "Họ tên người đến đón không được để trống khi xác nhận qua điện thoại.",
    validate: {
      notEmpty: (val: string) =>
        val.trim().length > 0 ||
        "Họ tên người đến đón không được để trống khi xác nhận qua điện thoại.",
      maxLength: (val: string) =>
        val.trim().length <= 100 ||
        "Họ tên người đến đón không được dài quá 100 ký tự.",
    },
  },
  pickupPersonId: {
    required: "Người đón đã đăng ký không được để trống.",
  },
};
