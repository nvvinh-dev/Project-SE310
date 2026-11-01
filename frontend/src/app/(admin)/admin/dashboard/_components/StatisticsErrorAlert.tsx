"use client";

import { Button, ErrorAlert, Icons } from "@/components";

interface StatisticsErrorAlertProps {
  title: string;
  message: string;
  onRetry: () => void;
}

// Lỗi trong một thẻ thống kê. Thẻ chỉ rộng một phần ba trang nên nút "Thử lại" đặt dưới thông báo:
// ErrorAlert có onRetry đặt nút bên cạnh, ép chữ còn vài từ mỗi dòng
export function StatisticsErrorAlert({ title, message, onRetry }: StatisticsErrorAlertProps) {
  return (
    <div className="space-y-2">
      <ErrorAlert title={title} message={message} />
      <Button size="sm" variant="outline" icon={<Icons.Refresh />} onClick={onRetry} className="min-h-11 sm:min-h-0">
        Thử lại
      </Button>
    </div>
  );
}
