"use client";

import { AlertTriangle, Check, Loader2, PackageCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adjustBatchStock } from "@/server/inventory";

interface AdjustStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batch: {
    id: string;
    batchNumber: string;
    medicineName: string;
    stockQuantity: number;
    packing?: string;
  } | null;
  onAdjusted?: () => void;
}

export function AdjustStockDialog({
  isOpen,
  onClose,
  batch,
  onAdjusted,
}: AdjustStockDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<
    "ADJUSTMENT" | "DAMAGE" | "EXPIRY" | "RETURN" | "PURCHASE"
  >("ADJUSTMENT");
  const [mode, setMode] = useState<"DELTA" | "NEW_TOTAL">("DELTA");
  const [quantityInput, setQuantityInput] = useState<string>("");
  const [newTotalInput, setNewTotalInput] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!batch) return null;

  const currentStock = batch.stockQuantity;

  // Compute delta and projected new stock
  let computedDelta = 0;
  let projectedStock = currentStock;

  if (mode === "DELTA") {
    const rawDelta = Number.parseInt(quantityInput, 10) || 0;
    // For DAMAGE, EXPIRY, RETURN defaults to deduction if positive
    if (
      (adjustmentType === "DAMAGE" ||
        adjustmentType === "EXPIRY" ||
        adjustmentType === "RETURN") &&
      rawDelta > 0
    ) {
      computedDelta = -rawDelta;
    } else {
      computedDelta = rawDelta;
    }
    projectedStock = currentStock + computedDelta;
  } else {
    const rawNew = Number.parseInt(newTotalInput, 10);
    if (!isNaN(rawNew)) {
      computedDelta = rawNew - currentStock;
      projectedStock = rawNew;
    }
  }

  const isInvalidStock = projectedStock < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (computedDelta === 0) {
      toast.error("Adjustment quantity cannot result in 0 change.");
      return;
    }

    if (projectedStock < 0) {
      toast.error("Adjusted stock quantity cannot fall below 0 units.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await adjustBatchStock({
        batchId: batch.id,
        type: adjustmentType,
        quantityChange: computedDelta,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        toast.success(
          `Stock for Batch ${batch.batchNumber} updated to ${res.newStock} units.`
        );
        onAdjusted?.();
        onClose();
        setQuantityInput("");
        setNewTotalInput("");
        setNotes("");
      } else {
        toast.error(res.error || "Failed to adjust stock.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred during stock adjustment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
                <PackageCheck className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Stock Reconciliation & Adjustment
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Update inventory counts and record an audit movement log.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-4 text-sm">
            {/* Target Item summary badge card */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-zinc-900 leading-tight">
                    {batch.medicineName}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    Batch: <span className="font-semibold text-zinc-700">{batch.batchNumber}</span>
                    {batch.packing && <span> &bull; {batch.packing}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Current Stock
                  </div>
                  <div className="font-extrabold text-lg text-zinc-900">
                    {currentStock} <span className="text-xs font-normal text-zinc-500">units</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Adjustment Type Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="adj-type" className="text-xs font-semibold text-zinc-700">
                Adjustment Reason / Type
              </Label>
              <Select
                value={adjustmentType}
                onValueChange={(val: any) => {
                  setAdjustmentType(val);
                  if (val === "DAMAGE" || val === "EXPIRY" || val === "RETURN") {
                    setMode("DELTA");
                  }
                }}
              >
                <SelectTrigger id="adj-type" className="w-full text-xs font-medium">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADJUSTMENT">
                    Count Correction (Audit / Physical Count)
                  </SelectItem>
                  <SelectItem value="DAMAGE">
                    Damaged / Broken Ampoules / Spoiled Units
                  </SelectItem>
                  <SelectItem value="EXPIRY">
                    Expired Stock Write-off / Disposal
                  </SelectItem>
                  <SelectItem value="RETURN">
                    Returned to Distributor / Supplier
                  </SelectItem>
                  <SelectItem value="PURCHASE">
                    Inward Stock Addition (Manual Entry)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Adjustment Mode toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-zinc-700">
                  Adjustment Input Method
                </Label>
                <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setMode("DELTA")}
                    className={`rounded-md px-2.5 py-1 transition-all ${
                      mode === "DELTA"
                        ? "bg-white font-semibold text-zinc-900 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Quantity Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("NEW_TOTAL")}
                    className={`rounded-md px-2.5 py-1 transition-all ${
                      mode === "NEW_TOTAL"
                        ? "bg-white font-semibold text-zinc-900 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Exact Count
                  </button>
                </div>
              </div>

              {mode === "DELTA" ? (
                <div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder={
                        adjustmentType === "DAMAGE" ||
                        adjustmentType === "EXPIRY" ||
                        adjustmentType === "RETURN"
                          ? "Units to deduct (e.g. 5)"
                          : "Units to change (+10 or -5)"
                      }
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(e.target.value)}
                      className="text-sm font-semibold"
                      required
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {adjustmentType === "DAMAGE" ||
                    adjustmentType === "EXPIRY" ||
                    adjustmentType === "RETURN"
                      ? "Entering a positive number automatically deducts that quantity from stock."
                      : "Enter positive number to add stock, or negative number to reduce."}
                  </p>
                </div>
              ) : (
                <div>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Enter newly verified physical count"
                    value={newTotalInput}
                    onChange={(e) => setNewTotalInput(e.target.value)}
                    className="text-sm font-semibold"
                    required
                  />
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Replaces current quantity of {currentStock} units with this exact count.
                  </p>
                </div>
              )}
            </div>

            {/* Projected Stock Preview */}
            <div className={`rounded-xl p-3 border text-xs flex items-center justify-between ${
              isInvalidStock
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-700"
            }`}>
              <div className="flex items-center gap-2">
                {isInvalidStock ? (
                  <AlertTriangle className="size-4 text-red-600" />
                ) : (
                  <Check className="size-4 text-emerald-600" />
                )}
                <span>
                  Resulting Stock:{" "}
                  <strong className={isInvalidStock ? "text-red-700" : "text-zinc-900"}>
                    {projectedStock} units
                  </strong>
                </span>
              </div>
              <span className="font-semibold">
                {computedDelta > 0 ? `+${computedDelta}` : computedDelta} units
              </span>
            </div>

            {/* Notes / Reason */}
            <div className="space-y-1.5">
              <Label htmlFor="adj-notes" className="text-xs font-semibold text-zinc-700">
                Audit Notes / Reference (Optional)
              </Label>
              <Input
                id="adj-notes"
                placeholder="e.g., Monthly physical audit, invoice #1029 return, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isInvalidStock || computedDelta === 0}
              className="text-xs font-semibold"
            >
              {isLoading && <Loader2 className="mr-2 size-3.5 animate-spin" />}
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
