"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  MessageSquare,
} from "lucide-react";
import { signOut } from "@/app/admin/actions";

const navItems = [
  { href: "/admin/dashboard",     label: "لوحة التحكم",      icon: LayoutDashboard },
  { href: "/admin/legal-content", label: "المحتوى القانوني", icon: BookOpen },
  { href: "/admin/ai-chat",       label: "المساعد القانوني", icon: MessageSquare },
  { href: "/admin/users",         label: "المستخدمين",        icon: Users },
  { href: "/admin/subscriptions", label: "الاشتراكات",        icon: CreditCard },
  { href: "/admin/settings",      label: "الإعدادات",         icon: Settings },
];

const pageTitles: Record<string, string> = {
  "/admin/dashboard":     "لوحة التحكم",
  "/admin/legal-content": "المحتوى القانوني",
  "/admin/ai-chat":       "المساعد القانوني",
  "/admin/users":         "المستخدمين",
  "/admin/subscriptions": "الاشتراكات",
  "/admin/settings":      "الإعدادات",
};

export default function AdminShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const pageTitle = pageTitles[pathname] ?? "لوحة الإدارة";

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#0B1F3A]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 z-30 h-full w-64 bg-[#0A1628] flex flex-col
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex justify-center py-6 border-b border-white/10">
          <Image src="/logo.png" alt="نبراس" width={72} height={72} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-[#C8A96A]/15 text-[#C8A96A] border border-[#C8A96A]/30"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {userEmail && (
            <p className="text-xs text-gray-500 px-4 truncate">{userEmail}</p>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-red-400 transition"
            >
              <LogOut size={18} />
              <span>خروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A1628]/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h1 className="text-white font-semibold text-lg">{pageTitle}</h1>
          </div>
          {userEmail && (
            <span className="text-sm text-gray-400 hidden sm:block">
              {userEmail}
            </span>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
