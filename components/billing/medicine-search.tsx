"use client";

import {
  Barcode,
  Loader2,
  Package,
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

  // Quick add batch modal state
  const [selectedMedForBatch, setSelectedMedForBatch] =
    useState<SearchMedicineItem | null>(null);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);

  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
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
    }, 180);

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
        // If exact barcode match or normal enter, auto-select FEFO batch
        if (activeMed.fefoBatch && activeMed.fefoBatch.hasStock) {
          onSelectBatch(activeMed, activeMed.fefoBatch, 1, true);
          setQuery("");
          setIsOpen(false);
        } else if (
          activeMed.batches.length > 0 &&
          activeMed.batches.some((b) => b.hasStock)
        ) {
          const valid = activeMed.batches.find((b) => b.hasStock);
          if (valid) {
            onSelectBatch(activeMed, valid, 1, true);
            setQuery("");
            setIsOpen(false);
          }
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

  const handleBatchSelected = (
    med: SearchMedicineItem,
    batch: SearchMedicineBatch
  ) => {
    if (batch.isExpired) return;
    onSelectBatch(med, batch, 1, true);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRefreshSearch = async () => {
    const res = await searchMedicinesForBilling(query);
    if (res.success && res.medicines) {
      setResults(res.medicines as SearchMedicineItem[]);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3 flex items-center gap-1.5 text-zinc-400">
          <Barcode className="size-5" />
          <Search className="size-4" />
        </div>
        <Input
          className="h-12 w-full rounded-xl border-zinc-300 bg-white pr-24 pl-16 font-medium text-sm text-zinc-900 shadow-xs transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Scan barcode or type medicine name / generic formula / brand (Press F2 or /)..."
          ref={inputRef}
          type="text"
          value={query}
        />

        <div className="absolute right-3 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-zinc-400" />
          ) : (
            <kbd className="hidden rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 shadow-2xs sm:inline-block">
              F2
            </kbd>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="fade-in zoom-in-95 absolute top-full z-50 mt-1.5 max-h-[460px] w-full animate-in overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-2xl duration-150">
          {isLoading && results.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-xs text-zinc-500">
              <Loader2 className="mr-2 size-4 animate-spin text-emerald-600" />
              Searching medicines and batches...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-sm text-zinc-800">
                No medicines found
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Try searching by brand, generic formula, or scan the barcode.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {results.map((med, idx) => {
                const isSelected = idx === selectedIndex;
                const hasStock = med.totalStock > 0;

                return (
                  <div
                    className={`p-3 transition-colors ${
                      isSelected ? "bg-emerald-50/60" : "hover:bg-zinc-50/80"
                    }`}
                    key={med.id}
                  >
                    {/* Top Row: Medicine Info & Tags */}
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-zinc-900">
                          {med.name}
                        </span>
                        {med.brand && (
                          <span className="font-medium text-xs text-zinc-500">
                            ({med.brand})
                          </span>
                        )}
                        {med.drugSchedule && (
                          <Badge
                            className="border-amber-300 bg-amber-50 px-1.5 py-0 font-bold text-[10px] text-amber-700"
                            variant="outline"
                          >
                            <ShieldAlert className="mr-1 size-2.5" />
                            {med.drugSchedule}
                          </Badge>
                        )}
                        {med.prescriptionRequired && (
                          <Badge
                            className="border-red-200 bg-red-50 px-1.5 py-0 font-bold text-[10px] text-red-600"
                            variant="outline"
                          >
                            Rx
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-500">
                          Pack:{" "}
                          <strong className="text-zinc-800">
                            {med.packing || "1 Unit"}
                          </strong>
                        </span>
                        <span className="text-zinc-300">|</span>
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            hasStock ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          <Package className="size-3.5" />
                          {hasStock
                            ? `${med.totalStock} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                    </div>

                    {/* Generic & Manufacturer */}
                    <div className="mt-0.5 flex items-center gap-3 text-[11px] text-zinc-500">
                      <span>Formula: {med.genericName}</span>
                      <span>•</span>
                      <span>Mfr: {med.manufacturer}</span>
                      {med.barcode && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-zinc-400">
                            [{med.barcode}]
                          </span>
                        </>
                      )}
                    </div>

                    {/* Batches Table for this Medicine */}
                    <div className="mt-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-2">
                      {med.batches.length === 0 ? (
                        <div className="flex items-center justify-between py-1 text-xs">
                          <span className="text-zinc-500 italic">
                            No batches currently recorded for this medicine.
                          </span>
                          <Button
                            className="h-7 cursor-pointer font-bold text-emerald-700 text-xs hover:bg-emerald-50"
                            onClick={() => {
                              setSelectedMedForBatch(med);
                              setIsAddBatchOpen(true);
                            }}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Plus className="mr-1 size-3" />
                            Add Batch / Stock
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-[10px] text-zinc-400 uppercase tracking-wider">
                            <span>Available Batches (FEFO Order)</span>
                            <button
                              className="flex items-center gap-0.5 text-emerald-600 hover:underline"
                              onClick={() => {
                                setSelectedMedForBatch(med);
                                setIsAddBatchOpen(true);
                              }}
                              type="button"
                            >
                              <Plus className="size-2.5" /> Add New Batch
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                            {med.batches.map((b) => {
                              const isFefo = med.fefoBatch?.id === b.id;
                              const expFormatted = new Date(
                                b.expiryDate
                              ).toLocaleDateString("en-IN", {
                                month: "short",
                                year: "numeric",
                              });

                              return (
                                <div
                                  className={`flex items-center justify-between rounded-md border p-2 text-xs transition-all ${
                                    b.isExpired
                                      ? "border-red-200 bg-red-50/50 opacity-60"
                                      : isFefo
                                        ? "border-emerald-300 bg-emerald-50 shadow-2xs"
                                        : "border-zinc-200 bg-white hover:border-zinc-300"
                                  }`}
                                  key={b.id}
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold font-mono text-zinc-900">
                                        {b.batchNumber}
                                      </span>
                                      {isFefo && !b.isExpired && (
                                        <span className="rounded bg-emerald-600 px-1 py-0.2 font-extrabold text-[9px] text-white uppercase">
                                          FEFO
                                        </span>
                                      )}
                                      {b.isExpired && (
                                        <span className="rounded bg-red-600 px-1 py-0.2 font-extrabold text-[9px] text-white uppercase">
                                          EXPIRED
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-zinc-500">
                                      <span>Exp: {expFormatted}</span>
                                      <span>•</span>
                                      <span
                                        className={
                                          b.stockQuantity > 0
                                            ? "font-bold text-zinc-800"
                                            : "text-red-500"
                                        }
                                      >
                                        {b.stockQuantity} units
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-zinc-900">
                                      {formatINR(b.mrp)}
                                    </span>
                                    <Button
                                      className={`h-7 px-2.5 font-bold text-xs ${
                                        isFefo
                                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                          : "bg-zinc-900 text-white hover:bg-zinc-800"
                                      }`}
                                      disabled={
                                        b.isExpired || b.stockQuantity <= 0
                                      }
                                      onClick={() =>
                                        handleBatchSelected(med, b)
                                      }
                                      size="sm"
                                      type="button"
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
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
          // If the medicine exists, auto-add this newly created batch
          if (selectedMedForBatch) {
            const updated = results.find(
              (r) => r.id === selectedMedForBatch.id
            );
            if (updated) {
              const b = updated.batches.find((b) => b.id === newBatchId);
              if (b) {
                onSelectBatch(updated, b, 1, true);
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
