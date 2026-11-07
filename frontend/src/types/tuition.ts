// Phản chiếu DTO học phí, hóa đơn và thanh toán (NhaTre.Application/DTOs/Tuition)

// Hai trạng thái hóa đơn, khớp InvoiceStatuses của backend (D40 mục 4). Hóa đơn mới luôn unpaid
// (BR-TUITION-09), chỉ chuyển sang paid khi Kế toán ghi nhận thanh toán
export type InvoiceStatus = "unpaid" | "paid";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};

// Hai hình thức nộp ngoài hệ thống, khớp PaymentMethods của backend (D21)
export type PaymentMethod = "Cash" | "BankTransfer";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  Cash: "Tiền mặt",
  BankTransfer: "Chuyển khoản",
};

// Biểu phí là một mức chung toàn trường: mô tả và số tiền (D39 mục 4)
export interface TuitionFeeResponse {
  id: string;
  description: string;
  amount: number;
}

export interface TuitionFeeRequest {
  description: string;
  amount: number;
}

// Hóa đơn phía Kế toán kèm họ tên trẻ. issuedAtUtc là thời điểm lập, theo UTC
export interface InvoiceResponse {
  id: string;
  childId: string;
  childFullName: string;
  amount: number;
  description: string;
  status: InvoiceStatus;
  issuedAtUtc: string;
}

// Dùng cho cả lập và sửa. Không có trạng thái: hóa đơn mới luôn unpaid do server đặt (BR-TUITION-09)
export interface InvoiceRequest {
  childId: string;
  amount: number;
  description: string;
}

// Chỉ hình thức và mã giao dịch; số tiền, thời điểm, người ghi nhận do server đặt (BR-TUITION-11).
// Tiền mặt gửi externalReference null
export interface RecordPaymentRequest {
  paymentMethod: PaymentMethod;
  externalReference: string | null;
}

export interface PaymentResponse {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  externalReference: string | null;
  paidAtUtc: string;
}
