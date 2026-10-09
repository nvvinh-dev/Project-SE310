"use client";

import React, { forwardRef, useState, useEffect, useRef, useId } from "react";

// ==========================================
// 1. Ô NHẬP LIỆU (INPUT)
// ==========================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      required,
      error,
      helperText,
      prefixIcon,
      suffixIcon,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-on-surface"
          >
            {label}
            {required && <span className="ml-1 text-error">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3.5 text-on-surface-variant pointer-events-none flex items-center">
              {prefixIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-required={required ? "true" : undefined}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={`w-full rounded-2xl border bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface transition-all placeholder:text-outline/70 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed ${
              prefixIcon ? "pl-11" : ""
            } ${suffixIcon ? "pr-11" : ""} ${
              error
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-slate-300 focus:border-primary focus:ring-primary/20"
            } ${className}`}
            {...props}
          />

          {suffixIcon && (
            <div className="absolute right-3.5 text-on-surface-variant pointer-events-none flex items-center">
              {suffixIcon}
            </div>
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-error font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-on-surface-variant">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

// ==========================================
// 2. Ô VĂN BẢN NHIỀU DÒNG (TEXTAREA - ĐẾM KÝ TỰ)
// ==========================================
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  currentValue?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      required,
      error,
      helperText,
      showCount = false,
      maxLength,
      disabled,
      className = "",
      value,
      defaultValue,
      currentValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const setRefs = (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
    };

    const [internalCharCount, setInternalCharCount] = useState<number>(() => {
      if (typeof currentValue === "string") return currentValue.length;
      if (typeof value === "string") return value.length;
      if (typeof defaultValue === "string") return defaultValue.length;
      return 0;
    });

    // Khi truyền currentValue (ví dụ lấy từ watch/useWatch của React Hook Form) hoặc value (controlled),
    // ưu tiên đếm thẳng theo giá trị đó để tự động cập nhật khi reset(data) / setValue().
    // Khi dùng uncontrolled thông thường, dùng state nội bộ cập nhật khi người dùng gõ hoặc nạp defaultValue.
    const charCount =
      typeof currentValue === "string"
        ? currentValue.length
        : typeof value === "string"
        ? value.length
        : internalCharCount;

    useEffect(() => {
      if (typeof currentValue !== "string" && typeof value !== "string" && internalRef.current) {
        setInternalCharCount(internalRef.current.value.length);
      }
    }, [currentValue, value, defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalCharCount(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };

    const isLimitReached = maxLength !== undefined && charCount >= maxLength;

    return (
      <div className="w-full space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-sm font-semibold text-on-surface"
            >
              {label}
              {required && <span className="ml-1 text-error">*</span>}
            </label>
          )}

          {showCount && maxLength !== undefined && (
            <span
              className={`text-xs font-medium ${
                isLimitReached ? "text-error font-bold" : "text-outline"
              }`}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={setRefs}
          id={textareaId}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-required={required ? "true" : undefined}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          className={`w-full rounded-2xl border bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface transition-all placeholder:text-outline/70 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed resize-y min-h-[90px] ${
            error
              ? "border-error focus:border-error focus:ring-error/20"
              : "border-slate-300 focus:border-primary focus:ring-primary/20"
          } ${className}`}
          {...props}
        />

        {error ? (
          <p id={`${textareaId}-error`} className="text-xs text-error font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${textareaId}-helper`} className="text-xs text-on-surface-variant">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// ==========================================
// 3. HỘP CHỌN (SELECT)
// ==========================================
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      required,
      error,
      helperText,
      placeholder,
      options,
      disabled,
      className = "",
      children,
      defaultValue,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    // Khi có placeholder và cả value lẫn defaultValue đều chưa đặt, gán defaultValue="" để hiển thị placeholder
    const computedDefaultValue =
      defaultValue !== undefined
        ? defaultValue
        : placeholder && value === undefined
        ? ""
        : undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-on-surface"
          >
            {label}
            {required && <span className="ml-1 text-error">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            value={value}
            defaultValue={computedDefaultValue}
            aria-required={required ? "true" : undefined}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                ? `${selectId}-helper`
                : undefined
            }
            className={`w-full appearance-none rounded-2xl border bg-surface-container-lowest px-4 py-2.5 pr-10 text-sm text-on-surface transition-all focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer ${
              error
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-slate-300 focus:border-primary focus:ring-primary/20"
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="pointer-events-none absolute right-3.5 text-on-surface-variant flex items-center">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {error ? (
          <p id={`${selectId}-error`} className="text-xs text-error font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-helper`} className="text-xs text-on-surface-variant">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

// ==========================================
// 4. HỘP KIỂM (CHECKBOX)
// ==========================================
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, description, error, disabled, className = "", required, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className="text-left space-y-1">
        <label
          htmlFor={checkboxId}
          className={`flex items-start gap-3 select-none ${
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        >
          <div className="relative flex items-center mt-0.5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              disabled={disabled}
              aria-required={required ? "true" : undefined}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? `${checkboxId}-error` : undefined}
              className={`peer h-5 w-5 appearance-none rounded-lg border bg-surface-container-lowest transition-all checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                error ? "border-error" : "border-slate-300"
              } ${className}`}
              {...props}
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>

          {(label || description) && (
            <div className="flex flex-col text-sm leading-snug">
              {label && (
                <span className="font-medium text-on-surface">
                  {label}
                  {required && <span className="ml-1 text-error">*</span>}
                </span>
              )}
              {description && (
                <span className="text-xs text-on-surface-variant mt-0.5">{description}</span>
              )}
            </div>
          )}
        </label>

        {error && (
          <p id={`${checkboxId}-error`} className="text-xs text-error font-medium ml-8">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
