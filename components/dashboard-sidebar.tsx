"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Home,
  Pill,
  Package,
  ShoppingCart,
  ReceiptText,
  Users,
  Truck,
  Undo2,
  Coins,
  BarChart3,
  Briefcase,
  Settings,
  Plus,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = user.role === "ADMIN";

  const adminLinks = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Medicines", href: "/dashboard/medicines", icon: Pill },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    { name: "Purchases", href: "/dashboard/purchases", icon: ShoppingCart },
    { name: "Sales / Billing", href: "/dashboard/billing", icon: ReceiptText },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
    { name: "Returns", href: "/dashboard/returns", icon: Undo2 },
    { name: "Expenses", href: "/dashboard/expenses", icon: Coins },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Staff", href: "/dashboard/staff", icon: Briefcase },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const staffLinks = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Billing", href: "/dashboard/billing", icon: ReceiptText },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Medicines", href: "/dashboard/medicines", icon: Pill },
  ];

  const links = isAdmin ? adminLinks : staffLinks;

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-zinc-900 select-none">
      {/* Header / Branding */}
      <div className="p-6 border-b border-zinc-150 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/icon.png"
            width={32}
            height={32}
            alt="MediBilldo Logo"
            className="size-8 object-contain rounded-md"
            priority
          />
          <span className="font-extrabold text-xl tracking-tight text-zinc-900">medibilldo</span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-zinc-500 hover:text-black transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Prominent Action Button: + NEW BILL */}
      <div className="px-4 py-4">
        <Link href="/dashboard/billing" onClick={() => setIsOpen(false)}>
          <Button className="w-full bg-black text-white hover:bg-zinc-800 transition-all font-bold flex items-center justify-center gap-2 py-5 shadow-xs rounded-lg group border-transparent">
            <Plus className="size-4 stroke-[3px] group-hover:scale-110 transition-transform" />
            <span>NEW BILL</span>
          </Button>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-zinc-100 text-zinc-900 font-bold border-l-2 border-black rounded-r-md rounded-l-none"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-transform group-hover:scale-105",
                  isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900"
                )}
              />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile & Logout */}
      <div className="p-4 border-t border-zinc-150 bg-zinc-50/50">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-950 truncate">{user.name}</p>
            <p className="text-xs text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
              {user.email}
            </p>
          </div>
          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 rounded border border-zinc-200">
            {user.role}
          </span>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-zinc-650 hover:text-zinc-950 hover:bg-white bg-white hover:shadow-xs gap-2 text-xs font-semibold py-2 px-3 border border-zinc-200 hover:border-zinc-300 rounded-lg transition-all"
        >
          <LogOut className="size-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-zinc-200 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white text-zinc-950 border-b border-zinc-150 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Image
            src="/icon.png"
            width={28}
            height={28}
            alt="MediBilldo Logo"
            className="size-7 object-contain rounded-md"
            priority
          />
          <span className="font-extrabold text-md tracking-tight">medibilldo</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 flex z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          {/* Menu Container */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-white shadow-2xl animate-in slide-in-from-left duration-250 ease-out border-r border-zinc-200">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
