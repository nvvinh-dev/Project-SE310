import type {
  InvoiceRequest,
  PaymentMethod,
  RecordPaymentRequest,
  TuitionFeeRequest,
  TuitionFeeResponse,
} from "@/types/tuition";

// Ô số tiền là input type="number": giá trị là chuỗi, rỗng khi chưa nhập hay nhập sai
export interface TuitionFeeFormValues {
  description: string;
  amount: string;
}

// Ô chọn trẻ bắt đầu rỗng (ui-screens.md §4.3)
export interface InvoiceFormValues {
  childId: string;
  description: string;
  amount: string;
}

// Hình thức thanh toán bắt đầu rỗng, không chọn sẵn (ui-screens.md §4.3)
export interface RecordPaymentFormValues {
  paymentMethod: PaymentMethod | "";
  externalReference: string;
}

export const MAX_FEE_DESCRIPTION_LENGTH = 500;
export const MAX_INVOICE_DESCRIPTION_LENGTH = 1000;
export const MAX_EXTERNAL_REFERENCE_LENGTH = 100;

// Quy tắc kiểm tra ô nhập, khớp TuitionFeeRequestValidator, InvoiceRequestValidator và
// RecordPaymentRequestValidator của backend (cùng giới hạn, cùng câu thông báo). Chuỗi đo sau khi trim vì
// backend lưu bản đã trim
type FieldRules<TValues> = { validate: Record<string, (value: string, formValues: TValues) => true | string> };

export const feeDescriptionRules: FieldRules<TuitionFeeFormValues> = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Mô tả biểu phí không được để trống.",
    maxLength: (value) =>
      value.trim().length <= MAX_FEE_DESCRIPTION_LENGTH ||
      `Mô tả biểu phí không được dài quá ${MAX_FEE_DESCRIPTION_LENGTH} ký tự.`,
  },
};

export const invoiceDescriptionRules: FieldRules<InvoiceFormValues> = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Mô tả hóa đơn không được để trống.",
    maxLength: (value) =>
      value.trim().length <= MAX_INVOICE_DESCRIPTION_LENGTH ||
      `Mô tả hóa đơn không được dài quá ${MAX_INVOICE_DESCRIPTION_LENGTH} ký tự.`,
  },
};

export const invoiceChildRules: FieldRules<InvoiceFormValues> = {
  validate: {
    required: (value) => value !== "" || "Trẻ không được để trống.",
  },
};

// Cột numeric(12,2): tối đa 10 chữ số phần nguyên, 2 chữ số phần thập phân. Backend bỏ qua số 0 ở cuối phần
// thập phân (PrecisionScale với ignoreTrailingZeros), số 0 ở đầu phần nguyên cũng không tính
const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;

// Ô type="number" nhận cả dạng mũ như 1e5; đổi về số thập phân thường trước khi đếm chữ số. Số quá lớn thì
// String() vẫn ra dạng mũ (1e+21) và bị coi là quá giới hạn
function fitsAmountPrecision(value: string): boolean {
  const raw = value.trim();
  const text = DECIMAL_PATTERN.test(raw) ? raw : String(Number(raw));
  if (!DECIMAL_PATTERN.test(text)) return false;
  const [integerPart, fractionPart = ""] = text.split(".");
  return integerPart.replace(/^0+/, "").length <= 10 && fractionPart.replace(/0+$/, "").length <= 2;
}

// Bỏ trống thì backend nhận 0, nên cùng câu "phải lớn hơn 0" như validator
export const amountRules: FieldRules<TuitionFeeFormValues | InvoiceFormValues> = {
  validate: {
    positive: (value) => Number(value) > 0 || "Số tiền phải lớn hơn 0.",
    precision: (value) =>
      fitsAmountPrecision(value) || "Số tiền chỉ được tối đa 10 chữ số phần nguyên và 2 chữ số phần thập phân.",
  },
};

export const paymentMethodRules: FieldRules<RecordPaymentFormValues> = {
  validate: {
    required: (value) => value !== "" || "Hình thức thanh toán không được để trống.",
  },
};

// D21: chỉ chuyển khoản mới có mã giao dịch; tiền mặt không hiện ô này
export const externalReferenceRules: FieldRules<RecordPaymentFormValues> = {
  validate: {
    required: (value, formValues) =>
      formValues.paymentMethod !== "BankTransfer" ||
      value.trim().length > 0 ||
      "Chuyển khoản phải có mã giao dịch.",
    maxLength: (value, formValues) =>
      formValues.paymentMethod !== "BankTransfer" ||
      value.trim().length <= MAX_EXTERNAL_REFERENCE_LENGTH ||
      `Mã giao dịch không được dài quá ${MAX_EXTERNAL_REFERENCE_LENGTH} ký tự.`,
  },
};

export function toTuitionFeeFormValues(fee: TuitionFeeResponse | null): TuitionFeeFormValues {
  return { description: fee?.description ?? "", amount: fee ? String(fee.amount) : "" };
}

export function toTuitionFeeRequest(values: TuitionFeeFormValues): TuitionFeeRequest {
  return { description: values.description.trim(), amount: Number(values.amount) };
}

export function toInvoiceRequest(values: InvoiceFormValues): InvoiceRequest {
  return { childId: values.childId, description: values.description.trim(), amount: Number(values.amount) };
}

// Tiền mặt gửi externalReference null: gửi kèm mã thì backend trả 400 (SCR-ACC-02, Hành vi 4)
export function toRecordPaymentRequest(
  values: RecordPaymentFormValues & { paymentMethod: PaymentMethod }
): RecordPaymentRequest {
  return {
    paymentMethod: values.paymentMethod,
    externalReference: values.paymentMethod === "BankTransfer" ? values.externalReference.trim() : null,
  };
}
