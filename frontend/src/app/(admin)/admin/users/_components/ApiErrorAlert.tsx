"use client";

import { ErrorAlert, Icons } from "@/components";
import { toApiError } from "@/lib/axios";

// Có errors (400 validate) thì hiện từng dòng, không có thì hiện một message (onboarding §4.4).
// Câu chữ luôn lấy từ backend qua toApiError, không tự viết theo từng status
export function ApiErrorAlert({ error, className = "" }: { error: unknown; className?: string }) {
  if (!error) return null;

  const apiError = toApiError(error);

  if (apiError.errors && apiError.errors.length > 0) {
    return (
      <div
        role="alert"
        className={`rounded-2xl border border-error/30 bg-error-container/40 p-4 text-left flex items-start gap-3 ${className}`}
      >
        <div className="text-error mt-0.5 shrink-0">
          <Icons.Alert />
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-error-container">{apiError.message}</h4>
          <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs text-error font-medium leading-relaxed">
            {apiError.errors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div role="alert">
      <ErrorAlert title="Không thực hiện được" message={apiError.message} className={className} />
    </div>
  );
}
