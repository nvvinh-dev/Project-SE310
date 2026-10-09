"use client";

import React, { forwardRef } from "react";
import { Icons } from "./Icons";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/95 shadow-sm focus-visible:ring-primary",
  secondary:
    "bg-surface-container-low text-on-surface hover:bg-slate-200/80 active:bg-slate-300/80 focus-visible:ring-primary",
  outline:
    "border border-slate-300 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low active:bg-slate-200/60 focus-visible:ring-primary",
  danger:
    "bg-error text-white hover:bg-error/90 active:bg-error/95 shadow-sm focus-visible:ring-error",
  ghost:
    "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface active:bg-slate-200/60 focus-visible:ring-primary",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-full gap-1.5",
  md: "px-4 py-2 text-sm font-semibold rounded-full gap-2",
  lg: "px-6 py-2.5 text-base font-semibold rounded-full gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      icon,
      disabled,
      className = "",
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center font-sans transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="shrink-0">
            <Icons.Spinner />
          </span>
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
