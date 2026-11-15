// Khớp CreateComplaintRequestValidator: bắt buộc, đo sau khi bỏ khoảng trắng hai đầu (D39 mục 18)
export const MAX_COMPLAINT_CONTENT_LENGTH = 2000;

export const complaintContentRules = {
  validate: (value: string) => {
    const trimmed = value.trim();
    if (trimmed === "") return "Vui lòng nhập nội dung phản ánh";
    if (trimmed.length > MAX_COMPLAINT_CONTENT_LENGTH)
      return `Nội dung phản ánh không được vượt quá ${MAX_COMPLAINT_CONTENT_LENGTH} ký tự`;
    return true;
  },
};
