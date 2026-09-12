"use client";

import { Loader2, Plus } from "lucide-react";
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
import { createMedicineBatch } from "@/server/billing";

interface AddBatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: {
    id: string;
    name: string;
    mrp: number;
    packing?: string | null;
  } | null;
  onBatchAdded: (batchId: string) => void;
}

export function AddBatchDialog({
  isOpen,
  onClose,
  medicine,
  onBatchAdded,
}: AddBatchDialogProps) {
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [mrp, setMrp] = useState(medicine ? String(medicine.mrp) : "");
  const [isLoading, setIsLoading] = useState(false);

  // Set default expiry date to 1 year from now
  const handleOpen = () => {
    if (!expiryDate) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setExpiryDate(nextYear.toISOString().split("T")[0]);
    }
    if (medicine && !mrp) {
      setMrp(String(medicine.mrp));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine) return;

    if (!batchNumber.trim()) {
      toast.error("Please enter a Batch Number");
      return;
    }

    if (!expiryDate) {
      toast.error("Please select an Expiry Date");
      return;
    }

    const qty = Number.parseInt(stockQuantity, 10);
    if (isNaN(qty) || qty < 0) {
      toast.error("Stock Quantity must be a positive number");
      return;
    }

    const mrpNum = Number.parseFloat(mrp);
    if (isNaN(mrpNum) || mrpNum <= 0) {
      toast.error("MRP must be greater than 0");
      return;
    }

    setIsLoading(true);
    try {
      const res = await createMedicineBatch({
        medicineId: medicine.id,
        batchNumber: batchNumber.trim().toUpperCase(),
        expiryDate: new Date(expiryDate).toISOString(),
        stockQuantity: qty,
        purchaseRate: purchaseRate
          ? Number.parseFloat(purchaseRate)
          : undefined,
        mrp: mrpNum,
      });

      if (res.success && res.batchId) {
        toast.success(`Batch ${batchNumber.toUpperCase()} added successfully!`);
        onBatchAdded(res.batchId);
        onClose();
        setBatchNumber("");
      } else {
        toast.error(res.error || "Failed to add batch");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) handleOpen();
        else onClose();
      }}
      open={isOpen}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Plus className="size-4" />
            </div>
            <div>
              <DialogTitle className="font-bold text-base">
                Add New Batch / Stock
              </DialogTitle>
              <DialogDescription className="text-xs">
                {medicine ? medicine.name : "Medicine Stock Entry"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs">Batch Number *</Label>
              <Input
                autoFocus
                className="font-mono text-xs uppercase"
                onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                placeholder="e.g. DOLO-B01"
                required
                value={batchNumber}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-xs">Expiry Date *</Label>
              <Input
                className="text-xs"
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                type="date"
                value={expiryDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs">
                Stock Qty (Units) *
              </Label>
              <Input
                className="font-bold text-xs"
                min="0"
                onChange={(e) => setStockQuantity(e.target.value)}
                required
                type="number"
                value={stockQuantity}
              />
              <span className="text-[10px] text-zinc-400">
                Total loose units
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-xs">MRP (₹) *</Label>
              <Input
                className="font-bold text-xs"
                min="0.01"
                onChange={(e) => setMrp(e.target.value)}
                required
                step="0.01"
                type="number"
                value={mrp}
              />
              <span className="text-[10px] text-zinc-400">Pack MRP</span>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-xs">Purchase Rate (₹)</Label>
              <Input
                className="text-xs"
                min="0"
                onChange={(e) => setPurchaseRate(e.target.value)}
                placeholder="Optional"
                step="0.01"
                type="number"
                value={purchaseRate}
              />
              <span className="text-[10px] text-zinc-400">Cost per pack</span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              className="text-xs"
              disabled={isLoading}
              onClick={onClose}
              size="sm"
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 font-bold text-white text-xs hover:bg-emerald-700"
              disabled={isLoading}
              size="sm"
              type="submit"
            >
              {isLoading && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              )}
              Save & Add to Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
