"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  InvoiceRequest,
  InvoiceResponse,
  InvoiceStatus,
  PaymentResponse,
  RecordPaymentRequest,
  TuitionFeeRequest,
  TuitionFeeResponse,
} from "@/types/tuition";
import { CHILDREN_QUERY_KEY } from "../../students/_lib/children-api";

export const TUITION_FEES_QUERY_KEY = ["tuition-fees"] as const;
export const INVOICES_QUERY_KEY = ["invoices"] as const;
// Báo cáo doanh thu (SCR-ACC-03) đọc tổng thu và số hóa đơn chưa thanh toán: mọi thao tác ghi hóa đơn làm mới
// theo tiền tố này (frontend-conventions.md §3.2)
export const REVENUE_REPORTS_QUERY_KEY = ["revenue-reports"] as const;

export interface InvoiceFilters {
  childId: string | null;
  status: InvoiceStatus | null;
}

export function invoicesQueryKey(filters: InvoiceFilters) {
  return [...INVOICES_QUERY_KEY, filters] as const;
}

// Thao tác ghi thành công luôn trả bản ghi sau khi đổi; thiếu data thì coi như lỗi
function unwrap<T>(res: { data: ApiResponse<T> }): T {
  const data = res.data.data;
  if (data === null) throw new Error("Phản hồi không có dữ liệu.");
  return data;
}

// Trường chỉ có một mức phí chung (D39 mục 4): backend trả danh sách 0 hoặc 1 phần tử, null là chưa có biểu phí
export function useTuitionFee() {
  return useQuery({
    queryKey: TUITION_FEES_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<TuitionFeeResponse[]>>("/api/tuition-fees");
      return res.data.data?.[0] ?? null;
    },
  });
}

// Ghi xong thì đặt ngay biểu phí backend trả về. Làm mới cả khi lỗi: 409 khi tạo nghĩa là Kế toán khác vừa tạo
// biểu phí, 404 khi sửa nghĩa là biểu phí đang hiện đã cũ
function useTuitionFeeMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<TuitionFeeResponse>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (fee) => {
      queryClient.setQueryData(TUITION_FEES_QUERY_KEY, fee);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TUITION_FEES_QUERY_KEY });
    },
  });
}

// FR-TUITION-01: trường đã có biểu phí → 409
export function useCreateTuitionFee() {
  return useTuitionFeeMutation(async (body: TuitionFeeRequest) =>
    unwrap(await apiClient.post<ApiResponse<TuitionFeeResponse>>("/api/tuition-fees", body))
  );
}

// Sửa biểu phí không làm đổi hóa đơn đã lập
export function useUpdateTuitionFee() {
  return useTuitionFeeMutation(async ({ id, body }: { id: string; body: TuitionFeeRequest }) =>
    unwrap(await apiClient.put<ApiResponse<TuitionFeeResponse>>(`/api/tuition-fees/${id}`, body))
  );
}

// Lọc ở server theo trẻ và trạng thái; bỏ tham số khi chọn "Tất cả". Backend trả toàn bộ, mới lập trước
export function useInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: invoicesQueryKey(filters),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<InvoiceResponse[]>>("/api/invoices", {
        params: { childId: filters.childId ?? undefined, status: filters.status ?? undefined },
      });
      return res.data.data ?? [];
    },
  });
}

// Mọi thao tác ghi hóa đơn làm mới danh sách hóa đơn và báo cáo doanh thu, kể cả khi lỗi: 404 hay 409 nghĩa là
// danh sách đang hiện đã cũ (hóa đơn vừa được ghi nhận thanh toán ở máy khác). Lỗi khi lập hay sửa còn có thể do
// danh sách trẻ (404 "Không tìm thấy trẻ.") hay biểu phí (409 chưa có biểu phí) đang hiện đã cũ, nên hai thao tác
// đó làm mới thêm cả hai (frontend-conventions.md §3.2)
function useInvoiceMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  { refreshChildrenAndFeeOnError }: { refreshChildrenAndFeeOnError: boolean }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onError: () => {
      if (!refreshChildrenAndFeeOnError) return;
      void queryClient.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: TUITION_FEES_QUERY_KEY });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: REVENUE_REPORTS_QUERY_KEY });
    },
  });
}

// FR-TUITION-02: hóa đơn mới luôn "Chưa thanh toán"; lưu xong phụ huynh của trẻ nhận thông báo
export function useCreateInvoice() {
  return useInvoiceMutation(
    async (body: InvoiceRequest) => unwrap(await apiClient.post<ApiResponse<InvoiceResponse>>("/api/invoices", body)),
    { refreshChildrenAndFeeOnError: true }
  );
}

// Chỉ hóa đơn "Chưa thanh toán" (BR-TUITION-12): hóa đơn vừa được ghi nhận thanh toán → 409
export function useUpdateInvoice() {
  return useInvoiceMutation(
    async ({ id, body }: { id: string; body: InvoiceRequest }) =>
      unwrap(await apiClient.put<ApiResponse<InvoiceResponse>>(`/api/invoices/${id}`, body)),
    { refreshChildrenAndFeeOnError: true }
  );
}

// FR-TUITION-06: server lấy số tiền của hóa đơn, thu đủ. Ghi nhận lần hai → 409 (AC-TUITION-11). Thành công thì đổi
// ngay hóa đơn sang "Đã thanh toán" trong mọi danh sách đang lưu, để dòng mất hai nút mà không chờ tải lại xong
// (frontend-conventions.md §3.2); tải lại vẫn chạy trong onSettled
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useInvoiceMutation(
    async ({ invoiceId, body }: { invoiceId: string; body: RecordPaymentRequest }) => {
      const payment = unwrap(
        await apiClient.post<ApiResponse<PaymentResponse>>(`/api/invoices/${invoiceId}/record-payment`, body)
      );
      queryClient.setQueriesData<InvoiceResponse[]>({ queryKey: INVOICES_QUERY_KEY }, (invoices) =>
        invoices?.map((invoice) =>
          invoice.id === payment.invoiceId ? { ...invoice, status: "paid" as const } : invoice
        )
      );
      return payment;
    },
    { refreshChildrenAndFeeOnError: false }
  );
}
