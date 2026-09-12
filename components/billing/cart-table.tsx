"use client";

import {
  AlertCircle,
  Barcode,
  Minus,
  Package,
  Pill,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CalculatedItemResult } from "@/lib/billing-calc";
import { formatINR } from "@/lib/billing-calc";
import type {
  SearchMedicineBatch,
  SearchMedicineItem,
} from "./medicine-search";

export interface CartLineItem {
  id: string; // unique item id in cart
  medicine: SearchMedicineItem;
  batch: SearchMedicineBatch;
  quantity: number; // in chosen unit (packs or loose)
  isPack: boolean; // true = Pack, false = Loose
  discountPercent: number;
  customRate?: number;
  calc: CalculatedItemResult;
  hasInsufficientStock: boolean;
}

interface CartTableProps {
  items: CartLineItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onToggleUnit: (id: string) => void;
  onUpdateDiscount: (id: string, newDis: number) => void;
  onUpdateBatch: (id: string, newBatchId: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onFocusSearch?: () => void;
}

export function CartTable({
  items,
  onUpdateQuantity,
  onToggleUnit,
  onUpdateDiscount,
  onUpdateBatch,
  onRemoveItem,
  onClearCart,
  onFocusSearch,
}: CartTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 border-dashed bg-white p-10 text-center shadow-xs">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-2xs">
          <Sparkles className="size-7" />
        </div>
        <h3 className="mt-3 font-extrabold text-base text-zinc-900">
          Ready for New Bill
        </h3>
        <p className="mt-1 max-w-md text-xs text-zinc-500 leading-relaxed">
          Scan a barcode or use the search bar above to begin adding medicines.
          Anyone can generate a bill in 3 simple steps:
        </p>

        {/* 3-Step Guided Card for Beginners */}
        <div className="mt-6 grid w-full max-w-lg grid-cols-3 gap-2.5 text-left">
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-600 font-extrabold text-[11px] text-white">
              1
            </span>
            <h4 className="mt-2 font-bold text-xs text-zinc-900">
              Scan / Search
            </h4>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Press{" "}
              <kbd className="rounded bg-white px-1 font-mono text-[10px] shadow-2xs">
                F2
              </kbd>{" "}
              or scan barcode.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3">
            <span className="flex size-6 items-center justify-center rounded-full bg-zinc-800 font-extrabold text-[11px] text-white">
              2
            </span>
            <h4 className="mt-2 font-bold text-xs text-zinc-900">Set Qty</h4>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Choose Strip or Tablet units.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-600 font-extrabold text-[11px] text-white">
              3
            </span>
            <h4 className="mt-2 font-bold text-xs text-zinc-900">Print (F4)</h4>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Cash or UPI, instant receipt.
            </p>
          </div>
        </div>

        {onFocusSearch && (
          <Button
            className="mt-6 cursor-pointer rounded-xl bg-zinc-900 font-bold text-white text-xs hover:bg-zinc-800"
            onClick={onFocusSearch}
            type="button"
          >
            <Barcode className="mr-1.5 size-4" />
            Start Adding Medicines (F2)
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xs">
      {/* Table Header Strip */}
      <div className="flex items-center justify-between border-zinc-100 border-b bg-zinc-50/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider">
            Bill Items
          </span>
          <Badge
            className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-extrabold text-[11px] text-emerald-800"
            variant="secondary"
          >
            {items.length} {items.length === 1 ? "medicine" : "medicines"}
          </Badge>
        </div>

        <Button
          className="h-7 cursor-pointer font-bold text-[11px] text-zinc-500 hover:bg-red-50 hover:text-red-600"
          onClick={onClearCart}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Trash2 className="mr-1 size-3.5" />
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200/80 bg-zinc-100/70 hover:bg-zinc-100/70">
              <TableHead className="w-7 px-2 text-center font-extrabold text-[11px] text-zinc-500 uppercase">
                #
              </TableHead>
              <TableHead className="min-w-[170px] px-2 font-extrabold text-[11px] text-zinc-700 uppercase">
                Medicine & Batch Details
              </TableHead>
              <TableHead className="w-[100px] px-1 text-center font-extrabold text-[11px] text-zinc-700 uppercase">
                Unit
              </TableHead>
              <TableHead className="w-[110px] px-1 text-center font-extrabold text-[11px] text-zinc-700 uppercase">
                Quantity
              </TableHead>
              <TableHead className="w-[85px] px-1 text-right font-extrabold text-[11px] text-zinc-700 uppercase">
                Rate / MRP
              </TableHead>
              <TableHead className="w-[65px] px-1 text-center font-extrabold text-[11px] text-zinc-700 uppercase">
                Dis %
              </TableHead>
              <TableHead className="w-[90px] px-1 text-right font-extrabold text-[11px] text-zinc-700 uppercase">
                Total (₹)
              </TableHead>
              <TableHead className="w-8 px-1 text-center" />
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-zinc-100">
            {items.map((item, index) => {
              const med = item.medicine;
              const batch = item.batch;
              const conv = med.conversionFactor || 1;
              const maxStock = batch.stockQuantity;
              const isMultiUnit = conv > 1;

              return (
                <TableRow
                  className={`transition-colors ${
                    item.hasInsufficientStock
                      ? "bg-red-50/85 hover:bg-red-50"
                      : "hover:bg-zinc-50/70"
                  }`}
                  key={item.id}
                >
                  {/* # */}
                  <TableCell className="w-7 px-2 text-center font-bold font-mono text-xs text-zinc-400 align-middle">
                    {index + 1}
                  </TableCell>

                  {/* Medicine Name + Generic + Batch / Expiry */}
                  <TableCell className="px-2 align-middle">
                    <div className="flex flex-col gap-0.5 py-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-extrabold text-sm text-zinc-950 leading-snug">
                          {med.name}
                        </span>
                        {med.drugSchedule && (
                          <Badge
                            className="border-amber-300 bg-amber-50 px-1 py-0 font-bold text-[9px] text-amber-700"
                            variant="outline"
                          >
                            {med.drugSchedule}
                          </Badge>
                        )}
                        {med.prescriptionRequired && (
                          <span className="rounded bg-red-100 px-1.5 py-0.2 font-extrabold font-mono text-[9px] text-red-700 uppercase">
                            Rx
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                        {med.batches.length > 1 ? (
                          <div className="relative inline-flex items-center">
                            <select
                              className="h-6 rounded-md border border-zinc-300 bg-white pr-4 pl-1.5 font-bold font-mono text-[10px] text-zinc-800 shadow-2xs focus:border-emerald-600 focus:outline-hidden"
                              onChange={(e) =>
                                onUpdateBatch(item.id, e.target.value)
                              }
                              value={batch.id}
                            >
                              {med.batches.map((b) => (
                                <option
                                  disabled={b.isExpired || b.stockQuantity <= 0}
                                  key={b.id}
                                  value={b.id}
                                >
                                  Batch {b.batchNumber} (Stock:{" "}
                                  {b.stockQuantity})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.2 font-bold font-mono text-[10px] text-zinc-800">
                            Batch: {batch.batchNumber}
                          </span>
                        )}

                        <span className="font-mono text-[11px] text-zinc-600 font-medium">
                          Exp:{" "}
                          {new Date(batch.expiryDate).toLocaleDateString(
                            "en-IN",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>

                        {med.packing && (
                          <>
                            <span className="text-zinc-300">•</span>
                            <span className="text-[11px] text-zinc-500 font-medium">
                              {med.packing}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Unit Type: Toggle only if multi-unit (strips of tablets), otherwise show clean static badge */}
                  <TableCell className="w-[100px] px-1 text-center align-middle">
                    {isMultiUnit ? (
                      <div className="inline-flex flex-col items-center gap-0.5">
                        <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100/90 p-0.5 shadow-2xs">
                          <button
                            className={`flex cursor-pointer items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-bold transition-all ${
                              item.isPack
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-zinc-600 hover:text-zinc-900"
                            }`}
                            onClick={() => onToggleUnit(item.id)}
                            title={`Sell in Pack (${conv} units per pack)`}
                            type="button"
                          >
                            <Package className="size-2.5" />
                            <span>Pack</span>
                          </button>
                          <button
                            className={`flex cursor-pointer items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-bold transition-all ${
                              !item.isPack
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-zinc-600 hover:text-zinc-900"
                            }`}
                            onClick={() => onToggleUnit(item.id)}
                            title="Sell in loose units / tablets"
                            type="button"
                          >
                            <Pill className="size-2.5" />
                            <span>Loose</span>
                          </button>
                        </div>
                        <span className="text-[10px] font-medium text-zinc-400">
                          {item.isPack ? `${conv} units/pack` : "Single unit"}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-semibold text-xs text-zinc-700 shadow-2xs">
                        <Package className="size-3 text-zinc-400" />
                        <span>{med.packing || "1 Unit"}</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Qty Controls */}
                  <TableCell className="w-[110px] px-1 text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          className="size-7 cursor-pointer rounded-lg border-zinc-200 bg-white p-0 text-zinc-700 shadow-2xs hover:bg-zinc-100"
                          onClick={() =>
                            onUpdateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          size="icon"
                          type="button"
                          variant="outline"
                        >
                          <Minus className="size-3" />
                        </Button>

                        <Input
                          className={`h-7 w-12 rounded-lg border text-center font-black font-mono text-xs shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                            item.hasInsufficientStock
                              ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20"
                              : "border-zinc-200 bg-white text-zinc-900 focus:border-emerald-600"
                          }`}
                          min="1"
                          onChange={(e) => {
                            const val = Number.parseInt(e.target.value, 10);
                            onUpdateQuantity(
                              item.id,
                              Number.isNaN(val) || val < 1 ? 1 : val
                            );
                          }}
                          type="number"
                          value={item.quantity}
                        />

                        <Button
                          className="size-7 cursor-pointer rounded-lg border-zinc-200 bg-white p-0 text-zinc-700 shadow-2xs hover:bg-zinc-100"
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }
                          size="icon"
                          type="button"
                          variant="outline"
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>

                      {item.hasInsufficientStock ? (
                        <span className="flex items-center justify-center gap-0.5 font-bold text-[10px] text-red-600">
                          <AlertCircle className="size-3" /> Max {maxStock} left
                        </span>
                      ) : isMultiUnit && item.isPack ? (
                        <span className="font-mono text-[10px] text-zinc-400 font-medium">
                          ={item.calc.baseUnitsSold} units
                        </span>
                      ) : null}
                    </div>
                  </TableCell>

                  {/* MRP / Rate */}
                  <TableCell className="w-[85px] px-1 text-right align-middle">
                    <span className="block font-mono font-extrabold text-xs text-zinc-900">
                      {formatINR(item.isPack ? batch.mrp : item.calc.unitPrice)}
                    </span>
                    <span className="block text-[9px] text-zinc-400 font-medium">
                      {item.isPack ? "per pack" : "per unit"}
                    </span>
                  </TableCell>

                  {/* Discount % */}
                  <TableCell className="w-[65px] px-1 text-center align-middle">
                    <div className="relative inline-flex items-center">
                      <Input
                        className="h-7 w-14 rounded-lg border-zinc-200 bg-white pr-4 pl-1 text-center font-bold font-mono text-xs shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-emerald-600"
                        max="100"
                        min="0"
                        onChange={(e) => {
                          const val = Number.parseFloat(e.target.value);
                          onUpdateDiscount(
                            item.id,
                            Number.isNaN(val) ? 0 : val
                          );
                        }}
                        placeholder="0"
                        step="1"
                        type="number"
                        value={item.discountPercent || ""}
                      />
                      <span className="pointer-events-none absolute right-1 font-bold text-[10px] text-zinc-400">
                        %
                      </span>
                    </div>
                  </TableCell>

                  {/* Line Total */}
                  <TableCell className="w-[90px] px-1 text-right align-middle">
                    <span className="block font-black font-mono text-sm text-zinc-950">
                      {formatINR(item.calc.totalAmount)}
                    </span>
                    {item.discountPercent > 0 && (
                      <span className="block font-mono text-[9px] font-bold text-emerald-600">
                        -{formatINR(item.calc.discountAmount)}
                      </span>
                    )}
                  </TableCell>

                  {/* Remove Item */}
                  <TableCell className="w-8 px-1 text-center align-middle">
                    <Button
                      className="size-7 cursor-pointer rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      onClick={() => onRemoveItem(item.id)}
                      size="icon"
                      title="Remove item"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
