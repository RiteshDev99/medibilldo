"use client";

import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  PackageX,
  Pill,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface InventoryCounts {
  total: number;
  lowStock: number;
  expiringSoon: number;
  expired: number;
  outOfStock: number;
}

interface InventorySummaryCardsProps {
  counts: InventoryCounts;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export function InventorySummaryCards({
  counts,
  activeTab,
  onSelectTab,
}: InventorySummaryCardsProps) {
  const cards = [
    {
      id: "ALL",
      label: "Total Medicines",
      count: counts.total,
      subtext: "In master catalog",
      icon: Pill,
      iconBg: "bg-zinc-100 text-zinc-800",
      accentBorder: "border-l-zinc-900",
      activeRing: "ring-zinc-900 border-zinc-900 bg-zinc-50/50",
      pillClass: "bg-zinc-900 text-white",
    },
    {
      id: "LOW_STOCK",
      label: "Low Stock",
      count: counts.lowStock,
      subtext: "At or below min level",
      icon: AlertTriangle,
      iconBg: "bg-orange-50 text-orange-600",
      accentBorder: "border-l-orange-500",
      activeRing: "ring-orange-500 border-orange-500 bg-orange-50/30",
      pillClass: counts.lowStock > 0 ? "bg-orange-600 text-white" : "bg-zinc-200 text-zinc-600",
    },
    {
      id: "EXPIRING_SOON",
      label: "Expiring Soon",
      count: counts.expiringSoon,
      subtext: "Within next 30 days",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600",
      accentBorder: "border-l-amber-500",
      activeRing: "ring-amber-500 border-amber-500 bg-amber-50/30",
      pillClass: counts.expiringSoon > 0 ? "bg-amber-600 text-white" : "bg-zinc-200 text-zinc-600",
    },
    {
      id: "EXPIRED",
      label: "Expired Stock",
      count: counts.expired,
      subtext: "Past expiry date",
      icon: AlertOctagon,
      iconBg: "bg-red-50 text-red-600",
      accentBorder: "border-l-red-600",
      activeRing: "ring-red-600 border-red-600 bg-red-50/30",
      pillClass: counts.expired > 0 ? "bg-red-600 text-white" : "bg-zinc-200 text-zinc-600",
    },
    {
      id: "OUT_OF_STOCK",
      label: "Out of Stock",
      count: counts.outOfStock,
      subtext: "Zero stock balance",
      icon: PackageX,
      iconBg: "bg-zinc-100 text-zinc-600",
      accentBorder: "border-l-zinc-500",
      activeRing: "ring-zinc-600 border-zinc-600 bg-zinc-50/40",
      pillClass: counts.outOfStock > 0 ? "bg-zinc-800 text-white" : "bg-zinc-200 text-zinc-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeTab === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectTab(card.id)}
            className={cn(
              "group relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-3.5 text-left shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-hidden",
              card.accentBorder,
              "border-l-4",
              isActive && cn("ring-2 ring-offset-1 shadow-sm", card.activeRing)
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-xs text-zinc-500 truncate">
                {card.label}
              </span>
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                  card.iconBg
                )}
              >
                <Icon className="size-3.5" />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between gap-2">
              <span className="font-black text-2xl text-zinc-900 tracking-tight">
                {card.count}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-bold text-[10px] tracking-wide transition-colors",
                  card.pillClass
                )}
              >
                {isActive ? "Active Filter" : "Filter"}
              </span>
            </div>

            <p className="mt-1 text-[11px] text-zinc-400 truncate">
              {card.subtext}
            </p>
          </button>
        );
      })}
    </div>
  );
}
