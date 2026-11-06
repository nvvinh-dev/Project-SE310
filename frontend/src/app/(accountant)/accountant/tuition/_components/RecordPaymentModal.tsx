"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ApiErrorAlert, Button, ConfirmDialog, Icons, Input, Modal } from "@/components";
import { formatMoney } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, type InvoiceResponse, type PaymentMethod, type PaymentResponse } from "@/types/tuition";
import { useRecordPayment } from "../_lib/tuition-api";
import {
  externalReferenceRules,
  MAX_EXTERNAL_REFERENCE_LENGTH,
  paymentMethodRules,
  toRecordPaymentRequest,
  type RecordPaymentFormValues,
} from "../_lib/tuition-rules";

interface RecordPaymentModalProps {
  invoice: InvoiceResponse;
  onClose: () => void;
  onSuccess: (payment: PaymentResponse) => void;
}

type ConfirmedValues = RecordPaymentFormValues & { paymentMethod: PaymentMethod };

const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "BankTransfer"];
const EMPTY_VALUES: RecordPaymentFormValues = { paymentMethod: "", externalReference: "" };

// FR-TUITION-06 (SCR-ACC-02, Hành vi 4), hai bước như khuôn đổi vai trò của SCR-ADM-02: chọn hình thức trong Modal,
// rồi xác nhận lại bằng ConfirmDialog vì ghi nhận không sửa và không hủy được (ui-screens.md §4.3). Không gửi số
// tiền: server lấy số tiền của hóa đơn, thu đủ (BR-TUITION-11)
export function RecordPaymentModal({ invoice, onClose, onSuccess }: RecordPaymentModalProps) {
  const recordPayment = useRecordPayment();
  // Có giá trị là đang ở bước xác nhận
  const [confirmed, setConfirmed] = useState<ConfirmedValues | null>(null);
  // Quay lại bước 1 thì form hiện lại lựa chọn vừa xác nhận
  const [formValues, setFormValues] = useState<RecordPaymentFormValues>(EMPTY_VALUES);

  if (confirmed) {
    return (
      <ConfirmRecordPaymentDialog
        invoice={invoice}
        values={confirmed}
        isPending={recordPayment.isPending}
        error={recordPayment.error}
        onBack={() => {
          recordPayment.reset();
          setFormValues(confirmed);
          setConfirmed(null);
        }}
        onConfirm={() =>
          recordPayment.mutate({ invoiceId: invoice.id, body: toRecordPaymentRequest(confirmed) }, { onSuccess })
        }
      />
    );
  }

  return <RecordPaymentForm invoice={invoice} defaultValues={formValues} onClose={onClose} onNext={setConfirmed} />;
}

interface RecordPaymentFormProps {
  invoice: InvoiceResponse;
  defaultValues: RecordPaymentFormValues;
  onClose: () => void;
  onNext: (values: ConfirmedValues) => void;
}

// Bước 1: hình thức bắt đầu rỗng, không chọn sẵn (ui-screens.md §4.3). Chỉ chuyển khoản có ô mã giao dịch (D21)
function RecordPaymentForm({ invoice, defaultValues, onClose, onNext }: RecordPaymentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RecordPaymentFormValues>({ defaultValues });

  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  // paymentMethodRules đã chặn ô rỗng nên tới đây luôn có hình thức
  const goToConfirm = handleSubmit((values) => {
    if (values.paymentMethod === "") return;
    onNext({ ...values, paymentMethod: values.paymentMethod });
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="md"
      title="Ghi nhận đã thu"
      description={`${invoice.childFullName} · ${formatMoney(invoice.amount)}`}
    >
      <form onSubmit={goToConfirm} noValidate className="space-y-4">
        <fieldset
          className="min-w-0 space-y-2"
          aria-describedby={errors.paymentMethod ? "payment-method-error" : undefined}
        >
          <legend className="text-sm font-semibold text-on-surface">
            Hình thức thanh toán<span className="ml-1 text-error">*</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-on-surface has-[:checked]:border-primary has-[:checked]:bg-primary-fixed/30"
              >
                <input
                  type="radio"
                  value={method}
                  className="w-4 h-4 accent-primary"
                  {...register("paymentMethod", paymentMethodRules)}
                />
                {PAYMENT_METHOD_LABELS[method]}
              </label>
            ))}
          </div>
          {errors.paymentMethod?.message && (
            <p id="payment-method-error" className="text-xs text-error font-medium">
              {errors.paymentMethod.message}
            </p>
          )}
        </fieldset>

        {/* D21: chỉ chuyển khoản có mã giao dịch; tiền mặt gửi externalReference null */}
        {paymentMethod === "BankTransfer" && (
          <Input
            label="Mã giao dịch"
            required
            autoFocus
            maxLength={MAX_EXTERNAL_REFERENCE_LENGTH}
            placeholder="Mã giao dịch ngân hàng"
            error={errors.externalReference?.message}
            {...register("externalReference", externalReferenceRules)}
          />
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 min-h-11 sm:min-h-0">
            Hủy
          </Button>
          <Button type="submit" className="flex-1 min-h-11 sm:min-h-0">
            Tiếp tục
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface ConfirmRecordPaymentDialogProps {
  invoice: InvoiceResponse;
  values: ConfirmedValues;
  isPending: boolean;
  error: unknown;
  onBack: () => void;
  onConfirm: () => void;
}

// Bước 2: nhắc lại trẻ, mô tả, số tiền, hình thức và mã giao dịch. Lỗi API (404, 409 đã ghi nhận ở máy khác) hiện
// ngay trong hộp thoại; chỉ đóng khi thành công (khuôn ConfirmChangeRoleDialog). Hủy là quay lại bước 1
function ConfirmRecordPaymentDialog({ invoice, values, isPending, error, onBack, onConfirm }: ConfirmRecordPaymentDialogProps) {
  const rows: { label: string; value: string; className: string }[] = [
    { label: "Trẻ", value: invoice.childFullName, className: "font-semibold break-words" },
    { label: "Mô tả", value: invoice.description, className: "whitespace-pre-wrap break-words" },
    { label: "Số tiền", value: formatMoney(invoice.amount), className: "font-semibold" },
    { label: "Hình thức", value: PAYMENT_METHOD_LABELS[values.paymentMethod], className: "" },
  ];
  if (values.paymentMethod === "BankTransfer") {
    rows.push({ label: "Mã giao dịch", value: values.externalReference.trim(), className: "break-all" });
  }

  return (
    <ConfirmDialog
      isOpen
      onClose={onBack}
      onConfirm={onConfirm}
      isLoading={isPending}
      title="Xác nhận ghi nhận đã thu"
      cancelText="Quay lại"
      confirmText="Ghi nhận"
      message={
        <div className="space-y-3 text-left">
          <dl className="rounded-2xl border border-slate-200/90 bg-surface-container-low/60 p-4 space-y-2">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-col sm:flex-row sm:gap-3">
                <dt className="sm:w-28 shrink-0 text-on-surface-variant">{row.label}</dt>
                <dd className={`text-on-surface ${row.className}`}>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="flex items-start gap-2 font-semibold text-amber-800">
            <span className="shrink-0 text-amber-600" aria-hidden="true">
              <Icons.Alert />
            </span>
            Ghi nhận không sửa và không hủy được.
          </p>
          <ApiErrorAlert error={error} />
        </div>
      }
    />
  );
}
