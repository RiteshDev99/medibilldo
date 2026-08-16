"use client";

import {
  BarChart3,
  Briefcase,
  Coins,
  Home,
  LogOut,
  Menu,
  Package,
  Pill,
  Plus,
  ReceiptText,
  Settings,
  ShoppingCart,
  Truck,
  Undo2,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  storeName?: string;
}

export function DashboardSidebar({ user, storeName }: SidebarProps) {
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
    <div className="flex h-full select-none flex-col bg-white text-zinc-900">

      <div className="flex items-center justify-between border-zinc-150 border-b p-5">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-black font-extrabold text-xs text-white tracking-tighter">
              mb
            </div>
            <span className="font-extrabold text-md tracking-tight">
              MediBilldo
            </span>
          </div>
          {/* {storeName && (
            <span className="mt-1.5 font-bold text-xs text-zinc-500 truncate">
              {storeName}
            </span>
          )} */}
        </div>
    
        <button
          className="text-zinc-500 transition-colors hover:text-black md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Prominent Action Button: + NEW BILL */}
      <div className="px-4 py-6">
        <Link href="/dashboard/billing" onClick={() => setIsOpen(false)}>
          <Button className="group flex w-full items-center justify-center gap-2 rounded-lg border-transparent bg-black py-5 font-bold text-white shadow-xs transition-all hover:bg-zinc-800">
            <Plus className="size-4 stroke-[3px] transition-transform group-hover:scale-110" />
            <span>NEW BILL</span>
          </Button>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-150",
                isActive
                  ? "rounded-r-md rounded-l-none border-black border-l-2 bg-zinc-100 font-bold text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
              href={link.href}
              key={link.name}
              onClick={() => setIsOpen(false)}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-transform group-hover:scale-105",
                  isActive
                    ? "text-zinc-900"
                    : "text-zinc-400 group-hover:text-zinc-900"
                )}
              />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile & Logout */}
      <div className="border-zinc-150 border-t bg-zinc-50/50 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-sm text-zinc-950">
              {user.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-zinc-500">
              {user.email}
            </p>
          </div>
          <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-bold text-[9px] text-zinc-800 uppercase tracking-wider">
            {user.role}
          </span>
        </div>
        <Button
          className="w-full justify-start gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold text-xs text-zinc-650 transition-all hover:border-zinc-300 hover:bg-white hover:text-zinc-950 hover:shadow-xs"
          onClick={handleLogout}
          variant="ghost"
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
      <aside className="fixed top-0 left-0 z-30 hidden h-screen w-64 flex-col border-zinc-200 border-r md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-zinc-150 border-b bg-white px-4 py-3 text-zinc-950 md:hidden">
        <div className="flex flex-col min-w-0">
          <span className="font-extrabold text-sm tracking-tight">
            MediBilldo
          </span>
          {storeName && (
            <span className="font-bold text-[10px] text-zinc-500 truncate max-w-[180px]">
              {storeName}
            </span>
          )}
        </div>
        <button
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 text-zinc-600 transition-colors hover:text-zinc-950"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          {/* Menu Container */}
          <div className="slide-in-from-left relative flex h-full w-64 max-w-xs animate-in flex-col border-zinc-200 border-r bg-white shadow-2xl duration-250 ease-out">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
