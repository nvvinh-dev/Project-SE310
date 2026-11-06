// Quy tắc kiểm tra ô nhập lưu ý sức khỏe (FR-HEALTH-06, D39 mục 14, AC-HEALTH-14)
// Tối đa 1000 ký tự sau khi bỏ khoảng trắng hai đầu (khớp UpdateHealthNotesRequestValidator.cs)
export const MAX_HEALTH_NOTES_LENGTH = 1000;

export interface HealthNotesFormValues {
  healthNotes: string;
}

export function validateHealthNotes(value: string | undefined | null): string | true {
  if (!value) return true;
  if (value.trim().length > MAX_HEALTH_NOTES_LENGTH) {
    return "Lưu ý sức khỏe không được dài quá 1000 ký tự.";
  }
  return true;
}
