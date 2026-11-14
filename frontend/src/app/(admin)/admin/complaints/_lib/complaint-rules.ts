import { COMPLAINT_STATUS_LABELS, type ComplaintStatus } from "@/types/complaint";

// Thứ tự nút lọc ở SCR-ADM-04 vùng 1; "" là Tất cả, không gửi tham số status
export const COMPLAINT_STATUS_FILTERS: { value: ComplaintStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "New", label: COMPLAINT_STATUS_LABELS.New },
  { value: "InProgress", label: COMPLAINT_STATUS_LABELS.InProgress },
  { value: "Resolved", label: COMPLAINT_STATUS_LABELS.Resolved },
];

// Khớp HandleComplaintRequestValidator: đo sau khi bỏ khoảng trắng hai đầu
export const MAX_RESOLUTION_LENGTH = 2000;

export const resolutionRules = {
  validate: (value: string) => {
    const trimmed = value.trim();
    if (trimmed === "") return "Vui lòng nhập kết quả xử lý";
    if (trimmed.length > MAX_RESOLUTION_LENGTH)
      return `Kết quả xử lý không được vượt quá ${MAX_RESOLUTION_LENGTH} ký tự`;
    return true;
  },
};
