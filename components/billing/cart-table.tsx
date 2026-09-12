"use client";

import { AlertCircle, Minus, Pill, Plus, Trash2 } from "lucide-react";
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
}

export function CartTable({
  items,
  onUpdateQuantity,
  onToggleUnit,
  onUpdateDiscount,
  onUpdateBatch,
  onRemoveItem,
  onClearCart,
}: CartTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 border-dashed bg-white p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 shadow-2xs">
          <Pill className="size-7" />
        </div>
        <h3 className="mt-3 font-extrabold text-base text-zinc-900">
          Bill is Empty
        </h3>
        <p className="mt-1 max-w-sm text-xs text-zinc-500 leading-relaxed">
          Scan a barcode or use the search bar above to add medicines to this
          bill.
        </p>
        <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-400">
          <kbd className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
            F2
          </kbd>
          <span>Focus Search</span>
          <span>•</span>
          <kbd className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
            Enter
          </kbd>
          <span>Add FEFO Batch</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs">
      <div className="flex items-center justify-between border-zinc-100 border-b bg-zinc-50/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs text-zinc-800 uppercase tracking-wider">
            Bill Items
          </span>
          <Badge
            className="rounded-full bg-emerald-100 px-2 py-0 font-extrabold text-[10px] text-emerald-800"
            variant="secondary"
          >
            {items.length} {items.length === 1 ? "item" : "items"}
          </Badge>
        </div>

        <Button
          className="h-7 font-semibold text-xs text-zinc-500 hover:bg-red-50 hover:text-red-600"
          onClick={onClearCart}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Trash2 className="mr-1 size-3.5" />
          Clear Cart
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 bg-zinc-100/50 hover:bg-zinc-100/50">
              <TableHead className="w-10 text-center font-bold text-[11px] text-zinc-500 uppercase">
                #
              </TableHead>
              <TableHead className="min-w-[200px] font-bold text-[11px] text-zinc-500 uppercase">
                Medicine & Generic
              </TableHead>
              <TableHead className="min-w-[150px] font-bold text-[11px] text-zinc-500 uppercase">
                Batch & Expiry
              </TableHead>
              <TableHead className="w-[110px] text-center font-bold text-[11px] text-zinc-500 uppercase">
                Unit Type
              </TableHead>
              <TableHead className="w-[130px] text-center font-bold text-[11px] text-zinc-500 uppercase">
                Qty
              </TableHead>
              <TableHead className="w-[100px] text-right font-bold text-[11px] text-zinc-500 uppercase">
                MRP / Rate
              </TableHead>
              <TableHead className="w-[90px] text-center font-bold text-[11px] text-zinc-500 uppercase">
                Dis %
              </TableHead>
              <TableHead className="w-[70px] text-center font-bold text-[11px] text-zinc-500 uppercase">
                GST
              </TableHead>
              <TableHead className="w-[110px] text-right font-bold text-[11px] text-zinc-500 uppercase">
                Amount (₹)
              </TableHead>
              <TableHead className="w-10 text-center" />
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-zinc-100">
            {items.map((item, index) => {
              const med = item.medicine;
              const batch = item.batch;
              const conv = med.conversionFactor || 1;
              const maxStock = batch.stockQuantity;

              return (
                <TableRow
                  className={`transition-colors ${
                    item.hasInsufficientStock
                      ? "bg-red-50/70 hover:bg-red-50"
                      : "hover:bg-zinc-50/60"
                  }`}
                  key={item.id}
                >
                  {/* # */}
                  <TableCell className="text-center font-bold font-mono text-xs text-zinc-400">
                    {index + 1}
                  </TableCell>

                  {/* Medicine Name & Generic */}
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-zinc-900">
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
                          <span className="font-bold text-[10px] text-red-600">
                            Rx
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {med.genericName} • {med.manufacturer}
                      </span>
                    </div>
                  </TableCell>

                  {/* Batch & Expiry Selection */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {med.batches.length > 1 ? (
                        <select
                          className="h-7 w-full rounded border border-zinc-200 bg-white px-1.5 font-bold font-mono text-[11px] text-zinc-800 shadow-2xs focus:border-emerald-600 focus:outline-hidden"
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
                              {b.batchNumber} (Stock: {b.stockQuantity}
                              {b.isExpired ? " - EXPIRED" : ""})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-bold font-mono text-xs text-zinc-800">
                          {batch.batchNumber}
                        </span>
                      )}

                      <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <span>
                          Exp:{" "}
                          {new Date(batch.expiryDate).toLocaleDateString(
                            "en-IN",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span>•</span>
                        <span
                          className={
                            item.hasInsufficientStock
                              ? "font-bold text-red-600"
                              : "text-zinc-600"
                          }
                        >
                          Stock: {maxStock} units
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Pack / Unit Toggle */}
                  <TableCell className="text-center">
                    <button
                      className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 bg-zinc-50 p-0.5 font-bold text-[10px] transition-all hover:bg-zinc-100"
                      onClick={() => onToggleUnit(item.id)}
                      title={
                        item.isPack
                          ? `Selling as Pack (1 Pack = ${conv} units)`
                          : `Selling as Loose Units (${med.uqcUnit || "Tablet"})`
                      }
                      type="button"
                    >
                      <span
                        className={`rounded px-1.5 py-0.5 transition-all ${
                          item.isPack
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "text-zinc-600"
                        }`}
                      >
                        Pack
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 transition-all ${
                          item.isPack
                            ? "text-zinc-600"
                            : "bg-emerald-600 text-white shadow-2xs"
                        }`}
                      >
                        Loose
                      </span>
                    </button>
                    <div className="mt-0.5 text-[9px] text-zinc-400">
                      {item.isPack ? `${conv} units/pack` : "Single unit"}
                    </div>
                  </TableCell>

                  {/* Qty +/- Controls */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        className="size-6 cursor-pointer rounded border-zinc-200 bg-white p-0 text-zinc-600 hover:bg-zinc-100"
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
                        className={`h-7 w-14 rounded border text-center font-bold text-xs ${
                          item.hasInsufficientStock
                            ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20"
                            : "border-zinc-200 bg-white text-zinc-900"
                        }`}
                        min="1"
                        onChange={(e) => {
                          const val = Number.parseInt(e.target.value, 10);
                          onUpdateQuantity(item.id, isNaN(val) ? 1 : val);
                        }}
                        type="number"
                        value={item.quantity}
                      />

                      <Button
                        className="size-6 cursor-pointer rounded border-zinc-200 bg-white p-0 text-zinc-600 hover:bg-zinc-100"
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
                      <span className="mt-1 flex items-center justify-center gap-0.5 font-bold text-[10px] text-red-600">
                        <AlertCircle className="size-2.5" /> Max {maxStock}
                      </span>
                    ) : (
                      <span className="mt-0.5 block font-mono text-[10px] text-zinc-400">
                        ={item.calc.baseUnitsSold} units
                      </span>
                    )}
                  </TableCell>

                  {/* MRP / Rate */}
                  <TableCell className="text-right font-bold font-mono text-xs text-zinc-800">
                    {formatINR(item.isPack ? batch.mrp : item.calc.unitPrice)}
                  </TableCell>

                  {/* Discount % */}
                  <TableCell className="text-center">
                    <div className="relative inline-flex items-center">
                      <Input
                        className="h-7 w-13 rounded border-zinc-200 bg-white pr-4 text-center font-medium text-xs shadow-2xs"
                        max="100"
                        min="0"
                        onChange={(e) => {
                          const val = Number.parseFloat(e.target.value);
                          onUpdateDiscount(item.id, isNaN(val) ? 0 : val);
                        }}
                        placeholder="0"
                        step="1"
                        type="number"
                        value={item.discountPercent || ""}
                      />
                      <span className="pointer-events-none absolute right-1.5 font-bold text-[10px] text-zinc-400">
                        %
                      </span>
                    </div>
                  </TableCell>

                  {/* GST % */}
                  <TableCell className="text-center font-medium text-xs text-zinc-600">
                    {med.gst}%
                  </TableCell>

                  {/* Line Total */}
                  <TableCell className="text-right font-extrabold font-mono text-sm text-zinc-950">
                    {formatINR(item.calc.totalAmount)}
                  </TableCell>

                  {/* Remove Item */}
                  <TableCell className="text-center">
                    <Button
                      className="size-7 text-zinc-400 hover:bg-red-50 hover:text-red-600"
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
