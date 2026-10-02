"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/auth";
import { Icons } from "./Icons";

export interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof Icons;
  iconColorClass?: string;
}

export interface DashboardLayoutProps {
  portalName: string;
  groupTitle: string;
  menuItems: NavItem[];
  children: React.ReactNode;
}

export const ROLE_VIETNAMESE_LABELS: Record<Role, string> = {
  Admin: "Quản trị viên",
  Teacher: "Giáo viên",
  Accountant: "Kế toán",
  Medical: "Nhân viên Y tế",
  Parent: "Phụ huynh",
};

export default function DashboardLayout({
  portalName,
  groupTitle,
  menuItems,
  children,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const activeMenu = menuItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const currentBreadcrumb = activeMenu ? activeMenu.label : "Tổng quan";

  const roleVietnamese = user?.role ? ROLE_VIETNAMESE_LABELS[user.role] : "Người dùng";
  const avatarLetter = user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U";

  return (
    <div className="bg-background text-base text-on-surface antialiased min-h-screen">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest shadow-[0_4px_20px_rgba(212,195,172,0.18)] z-50 flex flex-col justify-between px-6 py-6 transition-transform duration-300 overflow-y-auto ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <Icons.School />
              </div>
              <div className="flex flex-col">
                <span className="text-xl text-primary leading-tight font-bold">
                  Hệ thống Mầm non
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  Phân hệ Quản lý
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-full text-outline hover:bg-surface-container-low lg:hidden"
              aria-label="Đóng menu"
            >
              <Icons.Close />
            </button>
          </div>

          <div className="p-1 bg-surface-container-low rounded-full flex items-center gap-1 shadow-inner">
            <div className="flex-1 text-center py-1.5 px-2 rounded-full text-sm bg-primary text-on-primary shadow-sm transition-all font-medium flex items-center justify-center gap-1.5">
              <span>{portalName}</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <div className="px-4 pt-2 text-xs font-medium uppercase tracking-wider text-outline">
              {groupTitle}
            </div>

            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const IconComponent = Icons[item.icon];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "flex items-center justify-between px-6 py-2.5 rounded-full transition-all group bg-primary-container text-on-primary font-bold shadow-sm"
                      : "flex items-center justify-between px-6 py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all group font-medium"
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-on-primary" : item.iconColorClass || "text-on-surface-variant"}>
                      <IconComponent />
                    </span>
                    <span className="text-base">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-sm z-40 px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-full hover:bg-surface-container-low text-on-surface lg:hidden"
              aria-label="Mở menu"
            >
              <Icons.Menu />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-on-surface-variant">
              <span className="text-primary font-semibold">Dashboard</span>
              <span className="text-slate-400">/</span>
              <span className="text-on-surface">{portalName}</span>
              <span className="text-slate-400">/</span>
              <span className="text-on-surface-variant">{currentBreadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-low text-primary flex items-center justify-center font-bold">
                {avatarLetter}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm text-on-surface font-semibold leading-tight">
                  {user?.fullName}
                </span>
                <span className="text-xs text-primary font-medium leading-tight">
                  {roleVietnamese}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <button
              onClick={() => void logout()}
              aria-label="Đăng xuất"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-error text-sm font-medium hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer"
            >
              <Icons.Logout />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="w-full pt-16 bg-surface px-6 lg:px-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}