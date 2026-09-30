"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  iconColorClass?: string;
  badgeText?: string;
  badgeVariant?: "secondary" | "error" | "primary";
}

export interface DashboardLayoutProps {
  portalName: string;       // VD: "Cổng Giáo Viên", "Cổng Y Tế"
  groupTitle: string;       // VD: "Nhóm Giáo viên", "Nhóm Y tế học đường"
  menuItems: NavItem[];     // Danh sách mục menu làm tham số (Mục 1)
  contextBadge?: {
    icon: string;
    label: string;
  };
  supportHotline?: string;
  children: React.ReactNode;
}


export const ROLE_VIETNAMESE_LABELS: Record<Role, string> = {
  Admin: "Quản trị viên",
  Teacher: "Giáo viên",
  Accountant: "Kế toán",
  Medical: "Nhân viên Y tế",
  Parent: "Phụ huynh",
};

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida/AEtjO1VhUd7CXK0nU9ahEJPAp32Y7vvvT7TFbxtuMlSWzl3VO0A9NqbqwAFOLRCgI_BKhzSzraRNJOxFBJufVHyl5BgEdJZcdbEldiX9PR0jELdp8xd3H0_uj2_qqJxj8D_iZFmvyBLBKUwghC1KxLuY5FhzOnhzV095439Qht5Nw9h-V2X0YJS39jJnTfVIwdCjEeR33F-sWQy5Ng7g9fPJmwI13g6c91XMLfsejIztGQK5cdl6wyeIXFSq5GQ";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida/AEtjO1UB_SjGSe3wTtF3jlpu1onQNkqexgGpHt5ckcE3_TbX55J84XoJKocRcz_rfL98PmSbhlwjx-ZS42qBr6x-554JT28aRoeYA8f6dPSgLnrgxnHehf5dKUG96-EIDg_rKdNKDoJH_nH0DgAfziiTnLFk4za7UK6PH6lmG0fdgpfbKIiUNC8i28bG665cV-3PRwt7O4FETFkGDKQ4VubY3bcUEVNrzv6F1bqEx2lmNlm3Mp0I2heGR-kfYc4l";

export default function DashboardLayout({
  portalName,
  groupTitle,
  menuItems,
  contextBadge,
  supportHotline = "1900 6868",
  children,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const activeMenu = menuItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const currentBreadcrumb = activeMenu ? activeMenu.label : "Tổng quan";

  const roleVietnamese = user?.role
    ? ROLE_VIETNAMESE_LABELS[user.role]
    : "Người dùng";

  const todayFormatted = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  const getBadgeStyle = (variant?: NavItem["badgeVariant"]) => {
    switch (variant) {
      case "error":
        return "bg-error-container text-on-error-container";
      case "primary":
        return "bg-primary-fixed text-on-primary-fixed";
      case "secondary":
      default:
        return "bg-secondary-fixed text-on-secondary-fixed-variant";
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* Lớp phủ mờ khi mở menu ☰ trên điện thoại */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MENU BÊN TRÁI (SIDEBAR) */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest shadow-[0_4px_20px_rgba(212,195,172,0.18)] z-50 flex flex-col justify-between overflow-y-auto px-space-md py-space-md transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-space-md">
          {/* Logo & Tên trường */}
          <div className="flex items-center justify-between px-space-xs">
            <div className="flex items-center gap-space-sm">
              <img
                alt="Mầm Non Sao Mai Logo"
                className="h-8 w-auto object-contain"
                src={LOGO_URL}
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary leading-tight font-bold">
                  Mầm Non Sao Mai
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Hệ thống Quản lý Mầm non
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-full text-outline hover:bg-surface-container-low lg:hidden"
              aria-label="Đóng menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Badge Cổng hiện tại */}
          <div className="p-1 bg-surface-container-low rounded-full flex items-center gap-1 shadow-inner">
            <div className="flex-1 text-center py-1.5 px-2 rounded-full font-label-md text-label-md bg-primary text-on-primary shadow-[0_2px_8px_rgba(78,186,142,0.25)] transition-all flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span>{portalName}</span>
            </div>
          </div>

          {/* Danh sách mục menu truyền từ tham số */}
          <nav className="flex flex-col gap-space-xs">
            <div className="px-space-sm pt-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline">
              {groupTitle}
            </div>

            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "flex items-center justify-between px-space-md py-2.5 rounded-full transition-all group bg-primary-container text-on-primary font-bold shadow-[0_4px_12px_rgba(78,186,142,0.2)]"
                      : "flex items-center justify-between px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all group"
                  }
                >
                  <div className="flex items-center gap-space-sm">
                    <span
                      className={`material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform ${
                        isActive
                          ? "text-on-primary"
                          : item.iconColorClass || "text-on-surface-variant"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-title-md text-title-md">{item.label}</span>
                  </div>

                  {item.badgeText && (
                    <span
                      className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${getBadgeStyle(
                        item.badgeVariant
                      )}`}
                    >
                      {item.badgeText}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="flex flex-col gap-space-sm pt-space-md">
          <div className="bg-surface-container-low p-space-sm rounded-2xl flex items-center gap-space-sm shadow-[0_2px_8px_rgba(212,195,172,0.12)]">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">
                support_agent
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Hỗ trợ nghiệp vụ
              </span>
              <span className="font-body-sm text-body-sm text-secondary font-medium">
                Hotline: {supportHotline}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between px-space-xs text-outline">
            <span className="font-label-sm text-label-sm">
              Bản quyền Sao Mai Edu
            </span>
            <span className="font-label-sm text-label-sm font-semibold">v1.2</span>
          </div>
        </div>
      </aside>

      {/* THANH TRÊN CÙNG (HEADER) + NỘI DUNG */}
      <div className="lg:pl-72">
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_2px_12px_rgba(212,195,172,0.15)] z-40 px-space-md lg:px-space-lg flex items-center justify-between">
          <div className="flex items-center gap-space-sm lg:gap-space-md">
            {/* Mục 5: Trên điện thoại menu thu gọn lại thành nút ☰ (AC-NFR-03) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-full hover:bg-surface-container-low text-on-surface lg:hidden font-bold text-lg leading-none"
              aria-label="Mở menu"
            >
              ☰
            </button>

            <div className="hidden sm:flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
              <span className="text-primary font-semibold">MN Sao Mai</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface">{portalName}</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant">{currentBreadcrumb}</span>
            </div>

            {contextBadge && (
              <div className="hidden xl:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full text-on-surface hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  {contextBadge.icon}
                </span>
                <span className="font-label-md text-label-md font-semibold">
                  {contextBadge.label}
                </span>
              </div>
            )}
          </div>

          {/* Mục 3: Thanh trên cùng hiện họ tên (fullName), tên vai trò bằng tiếng Việt, và nút Đăng xuất */}
          <div className="flex items-center gap-space-sm lg:gap-space-md">
            <div className="hidden md:flex items-center gap-1 text-on-surface-variant font-label-md text-label-md bg-surface-container-low px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[18px] text-tertiary">
                calendar_today
              </span>
              <span className="capitalize">{todayFormatted}</span>
            </div>

            <button className="relative p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[22px]">
                notifications
              </span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface-container-lowest"></span>
            </button>

            <div className="h-6 w-px bg-outline-variant"></div>

            <div className="flex items-center gap-space-sm">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                src={DEFAULT_AVATAR}
              />
              <div className="flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">
                  {user?.fullName}
                </span>
                <span className="font-label-sm text-label-sm text-primary font-medium leading-tight">
                  {roleVietnamese}
                </span>
              </div>
            </div>

            <button
              onClick={() => void logout()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-error font-label-md text-label-md hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="w-full pt-16 bg-surface px-space-md lg:px-space-lg min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}