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
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest shadow-[0_4px_20px_rgba(212,195,172,0.18)] z-50 flex flex-col justify-between px-space-md py-space-md transition-transform duration-300 overflow-y-auto ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between px-space-xs">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <Icons.School />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary leading-tight font-bold">
                  Hệ thống Mầm non
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
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
            <div className="flex-1 text-center py-1.5 px-2 rounded-full font-label-md text-label-md bg-primary text-on-primary shadow-sm transition-all flex items-center justify-center gap-1.5">
              <span>{portalName}</span>
            </div>
          </div>

          <nav className="flex flex-col gap-space-xs">
            <div className="px-space-sm pt-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline">
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
                      ? "flex items-center justify-between px-space-md py-2.5 rounded-full transition-all group bg-primary-container text-on-primary font-bold shadow-sm"
                      : "flex items-center justify-between px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all group"
                  }
                >
                  <div className="flex items-center gap-space-sm">
                    <span className={isActive ? "text-on-primary" : item.iconColorClass || "text-on-surface-variant"}>
                      <IconComponent />
                    </span>
                    <span className="font-title-md text-title-md">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-sm z-40 px-space-md lg:px-space-lg flex items-center justify-between">
          <div className="flex items-center gap-space-sm lg:gap-space-md">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-full hover:bg-surface-container-low text-on-surface lg:hidden"
              aria-label="Mở menu"
            >
              <Icons.Menu />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
              <span className="text-primary font-semibold">Dashboard</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface">{portalName}</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant">{currentBreadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm lg:gap-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-surface-container-low text-primary flex items-center justify-center font-bold">
                {avatarLetter}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">
                  {user?.fullName}
                </span>
                <span className="font-label-sm text-label-sm text-primary font-medium leading-tight">
                  {roleVietnamese}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-outline-variant hidden sm:block"></div>

            <button
              onClick={() => void logout()}
              aria-label="Đăng xuất"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-error font-label-md text-label-md hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer"
            >
              <Icons.Logout />
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