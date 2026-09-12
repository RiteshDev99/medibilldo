"use client";

import {
  Barcode,
  ChevronDown,
  Layers,
  Loader2,
  Minus,
  Package,
  Pill,
  Plus,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/billing-calc";
import { searchMedicinesForBilling } from "@/server/billing";
import { AddBatchDialog } from "./add-batch-dialog";

export interface SearchMedicineBatch {
  id: string;
  batchNumber: string;
  expiryDate: Date | string;
  stockQuantity: number;
  purchaseRate: number | null;
  mrp: number;
  isExpired: boolean;
  isLowStock: boolean;
  hasStock: boolean;
}

export interface SearchMedicineItem {
  id: string;
  name: string;
  shortName: string | null;
  genericName: string;
  manufacturer: string;
  brand: string | null;
  category: string;
  productType: string | null;
  packing: string;
  conversionFactor: number;
  uqcUnit: string | null;
  hsn: string | null;
  gst: number;
  cess: number | null;
  mrp: number;
  barcode: string | null;
  drugSchedule: string | null;
  prescriptionRequired: boolean;
  totalStock: number;
  batches: SearchMedicineBatch[];
  fefoBatch: SearchMedicineBatch | null;
}

interface MedicineSearchProps {
  onSelectBatch: (
    medicine: SearchMedicineItem,
    batch: SearchMedicineBatch,
    quantity: number,
    isPack: boolean
  ) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function MedicineSearch({
  onSelectBatch,
  inputRef: externalInputRef,
}: MedicineSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchMedicineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Inline Quick Add controls for speed billing
  const [quickQty, setQuickQty] = useState(1);
  const [quickIsPack, setQuickIsPack] = useState(true);

  // Active medicine with expanded batches
  const [expandedMedId, setExpandedMedId] = useState<string | null>(null);

  // Quick add batch modal state
  const [selectedMedForBatch, setSelectedMedForBatch] =
    useState<SearchMedicineItem | null>(null);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);

  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await searchMedicinesForBilling(query);
        if (res.success && res.medicines) {
          setResults(res.medicines as SearchMedicineItem[]);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 160);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddBatch = (
    med: SearchMedicineItem,
    batch: SearchMedicineBatch
  ) => {
    if (batch.isExpired || batch.stockQuantity <= 0) return;
    onSelectBatch(med, batch, quickQty, quickIsPack);
    setQuery("");
    setIsOpen(false);
    setExpandedMedId(null);
    setQuickQty(1); // Reset to 1 for next item
    inputRef.current?.focus();
  };

  // Keyboard navigation & Barcode scanner detection
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0) {
        const activeMed = results[selectedIndex] || results[0];
        // Auto-select FEFO batch or first batch with stock
        const targetBatch =
          activeMed.fefoBatch && activeMed.fefoBatch.hasStock
            ? activeMed.fefoBatch
            : activeMed.batches.find((b) => b.hasStock && !b.isExpired);

        if (targetBatch) {
          handleAddBatch(activeMed, targetBatch);
        } else {
          // Open add batch dialog if no stock
          setSelectedMedForBatch(activeMed);
          setIsAddBatchOpen(true);
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleRefreshSearch = async () => {
    const res = await searchMedicinesForBilling(query);
    if (res.success && res.medicines) {
      setResults(res.medicines as SearchMedicineItem[]);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* High-Speed Search & Direct Quantity Toolbar */}
      <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200/90 bg-white p-2 shadow-xs sm:flex-row sm:items-center">
        {/* Main Search Input */}
        <div className="relative flex flex-1 items-center">
          <div className="pointer-events-none absolute left-3.5 flex items-center gap-2 text-zinc-400">
            <Barcode className="size-5 text-emerald-600" />
            <Search className="size-4" />
          </div>
          <Input
            className="h-11 w-full rounded-xl border-transparent bg-zinc-50/80 pr-12 pl-16 font-medium text-sm text-zinc-900 shadow-none transition-all placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20"
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Scan barcode or type medicine / generic name (Press F2 or /)..."
            ref={inputRef}
            type="text"
            value={query}
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-emerald-600" />
            ) : (
              <kbd className="hidden rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 shadow-2xs sm:inline-block">
                F2
              </kbd>
            )}
          </div>
        </div>

        {/* Quick Quantity & Unit Selector Directly in the Add Bar */}
        <div className="flex items-center justify-between gap-2 border-zinc-100 border-t pt-2 sm:border-t-0 sm:pt-0">
          {/* Unit Toggle: Pack (Strip/Bottle) vs Loose (Tablet/Unit) */}
          <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-100/70 p-1">
            <button
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold text-xs transition-all ${
                quickIsPack
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
              onClick={() => setQuickIsPack(true)}
              title="Sell in full packs / strips"
              type="button"
            >
              <Package className="size-3.5" />
              <span>Pack</span>
            </button>
            <button
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold text-xs transition-all ${
                quickIsPack
                  ? "text-zinc-500 hover:text-zinc-900"
                  : "bg-white text-emerald-800 shadow-xs"
              }`}
              onClick={() => setQuickIsPack(false)}
              title="Sell in loose tablets / units"
              type="button"
            >
              <Pill className="size-3.5" />
              <span>Loose</span>
            </button>
          </div>

          {/* Quick Qty Stepper */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-1.5 py-0.5">
            <span className="px-1 font-bold text-[10px] text-zinc-400 uppercase">
              Qty
            </span>
            <Button
              className="size-7 rounded-lg border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100"
              onClick={() => setQuickQty((q) => Math.max(1, q - 1))}
              size="icon"
              type="button"
              variant="outline"
            >
              <Minus className="size-3" />
            </Button>
            <Input
              className="h-7 w-12 border-0 bg-transparent text-center font-extrabold font-mono text-xs text-zinc-900 shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="1"
              onChange={(e) => {
                const val = Number.parseInt(e.target.value, 10);
                setQuickQty(Number.isNaN(val) || val < 1 ? 1 : val);
              }}
              type="number"
              value={quickQty}
            />
            <Button
              className="size-7 rounded-lg border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100"
              onClick={() => setQuickQty((q) => q + 1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <Plus className="size-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decluttered, Clean Search Dropdown */}
      {isOpen && query.trim() && (
        <div className="fade-in zoom-in-95 absolute top-full z-50 mt-2 max-h-[420px] w-full animate-in overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl duration-150">
          {isLoading && results.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-xs text-zinc-500">
              <Loader2 className="mr-2 size-4 animate-spin text-emerald-600" />
              Searching medicines and stock...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-sm text-zinc-800">
                No medicines found
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Try searching by medicine name, formula, or barcode.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {results.map((med, idx) => {
                const isSelected = idx === selectedIndex;
                const hasStock = med.totalStock > 0;
                const bestBatch =
                  med.fefoBatch ||
                  med.batches.find((b) => b.hasStock && !b.isExpired) ||
                  med.batches[0];
                const isExpanded = expandedMedId === med.id;
                const hasMultipleBatches = med.batches.length > 1;

                return (
                  <div
                    className={`p-3 transition-colors ${
                      isSelected ? "bg-emerald-50/70" : "hover:bg-zinc-50/80"
                    }`}
                    key={med.id}
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      {/* Left: Medicine Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold text-sm text-zinc-900">
                            {med.name}
                          </span>
                          {med.packing && (
                            <Badge
                              className="border-zinc-200 bg-zinc-100 px-1.5 py-0 font-medium text-[10px] text-zinc-600"
                              variant="outline"
                            >
                              {med.packing}
                            </Badge>
                          )}
                          {med.drugSchedule && (
                            <Badge
                              className="border-amber-200 bg-amber-50 px-1.5 py-0 font-bold text-[9px] text-amber-700"
                              variant="outline"
                            >
                              <ShieldAlert className="mr-0.5 size-2.5" />
                              {med.drugSchedule}
                            </Badge>
                          )}
                          {med.prescriptionRequired && (
                            <span className="font-extrabold text-[10px] text-red-600">
                              Rx
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                          <span>{med.genericName}</span>
                          <span>•</span>
                          <span>{med.manufacturer}</span>
                          <span>•</span>
                          <span
                            className={
                              hasStock
                                ? "font-bold text-emerald-700"
                                : "font-semibold text-red-600"
                            }
                          >
                            {hasStock
                              ? `${med.totalStock} in stock`
                              : "Out of stock"}
                          </span>
                        </div>
                      </div>

                      {/* Right: Best FEFO Batch Preview & One-Click Add */}
                      <div className="flex items-center gap-3">
                        {bestBatch ? (
                          <div className="flex items-center gap-2">
                            <div className="text-right text-xs">
                              <div className="flex items-center justify-end gap-1">
                                <span className="font-mono font-semibold text-[11px] text-zinc-700">
                                  Batch: {bestBatch.batchNumber}
                                </span>
                                {med.fefoBatch?.id === bestBatch.id && (
                                  <span className="rounded bg-emerald-100 px-1 py-0.2 font-bold font-mono text-[9px] text-emerald-800 uppercase">
                                    FEFO
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[10px] text-zinc-400">
                                Exp:{" "}
                                {new Date(
                                  bestBatch.expiryDate
                                ).toLocaleDateString("en-IN", {
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="block font-extrabold font-mono text-sm text-zinc-900">
                                {formatINR(bestBatch.mrp)}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                MRP
                              </span>
                            </div>

                            <Button
                              className="h-8 cursor-pointer rounded-xl bg-emerald-600 px-3 font-bold text-white text-xs shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                              disabled={
                                bestBatch.isExpired ||
                                bestBatch.stockQuantity <= 0
                              }
                              onClick={() => handleAddBatch(med, bestBatch)}
                              size="sm"
                              type="button"
                            >
                              <Plus className="mr-1 size-3.5" />
                              Add ({quickQty} {quickIsPack ? "Pack" : "Unit"})
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="h-8 cursor-pointer font-bold text-emerald-700 text-xs hover:bg-emerald-50"
                            onClick={() => {
                              setSelectedMedForBatch(med);
                              setIsAddBatchOpen(true);
                            }}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Plus className="mr-1 size-3" />
                            Add Batch
                          </Button>
                        )}

                        {/* Batch toggle if multiple */}
                        {hasMultipleBatches && (
                          <button
                            className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] text-zinc-600 hover:bg-zinc-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedMedId(isExpanded ? null : med.id);
                            }}
                            title="Choose another batch"
                            type="button"
                          >
                            <Layers className="size-3 text-zinc-500" />
                            <span>{med.batches.length} Batches</span>
                            <ChevronDown
                              className={`size-3 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sub-list of Batches when expanded */}
                    {isExpanded && (
                      <div className="mt-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5">
                        <div className="mb-1.5 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-zinc-600">
                            Select Batch for {med.name}:
                          </span>
                          <button
                            className="font-bold text-emerald-600 hover:underline"
                            onClick={() => {
                              setSelectedMedForBatch(med);
                              setIsAddBatchOpen(true);
                            }}
                            type="button"
                          >
                            + Add New Batch
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3">
                          {med.batches.map((b) => {
                            const isFefo = med.fefoBatch?.id === b.id;
                            return (
                              <button
                                className={`flex items-center justify-between rounded-lg border p-2 text-left text-xs transition-all ${
                                  b.isExpired
                                    ? "cursor-not-allowed border-red-200 bg-red-50/40 opacity-60"
                                    : "border-zinc-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50"
                                }`}
                                disabled={b.isExpired || b.stockQuantity <= 0}
                                key={b.id}
                                onClick={() => handleAddBatch(med, b)}
                                type="button"
                              >
                                <div>
                                  <div className="flex items-center gap-1 font-bold font-mono text-zinc-900">
                                    <span>{b.batchNumber}</span>
                                    {isFefo && (
                                      <span className="rounded bg-emerald-600 px-1 py-0.2 text-[8px] text-white">
                                        FEFO
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-zinc-500">
                                    Exp:{" "}
                                    {new Date(b.expiryDate).toLocaleDateString(
                                      "en-IN",
                                      {
                                        month: "2-digit",
                                        year: "2-digit",
                                      }
                                    )}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold font-mono text-zinc-900">
                                    {formatINR(b.mrp)}
                                  </span>
                                  <span
                                    className={`block text-[10px] ${
                                      b.stockQuantity > 0
                                        ? "text-emerald-700"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {b.stockQuantity} in stock
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Batch Dialog */}
      <AddBatchDialog
        isOpen={isAddBatchOpen}
        medicine={selectedMedForBatch}
        onBatchAdded={async (newBatchId) => {
          await handleRefreshSearch();
          if (selectedMedForBatch) {
            const updated = results.find(
              (r) => r.id === selectedMedForBatch.id
            );
            if (updated) {
              const b = updated.batches.find((b) => b.id === newBatchId);
              if (b) {
                onSelectBatch(updated, b, quickQty, quickIsPack);
                setIsOpen(false);
              }
            }
          }
        }}
        onClose={() => setIsAddBatchOpen(false)}
      />
    </div>
  );
}
