// So sánh không phân biệt hoa thường và dấu tiếng Việt, để gõ "nguyen" vẫn tìm ra "Nguyễn".
// Dùng chung cho mọi vai trò (frontend-conventions.md §1)
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
