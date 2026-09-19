"use client";

import { Calendar, Edit3, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { updateBatchDetails } from "@/server/inventory";

interface EditBatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batch: {
    id: string;
    batchNumber: string;
    medicineName: string;
    expiryDate: Date | string;
    manufacturingDate?: Date | string | null;
    purchaseRate?: number | null;
    mrp: number;
    stockQuantity: number;
  } | null;
  onUpdated?: () => void;
}

export function EditBatchDialog({
  isOpen,
  onClose,
  batch,
  onUpdated,
}: EditBatchDialogProps) {
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [mrp, setMrp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (batch) {
      setBatchNumber(batch.batchNumber || "");
      if (batch.expiryDate) {
        const d = new Date(batch.expiryDate);
        setExpiryDate(d.toISOString().split("T")[0]);
      } else {
        setExpiryDate("");
      }
      if (batch.manufacturingDate) {
        const d = new Date(batch.manufacturingDate);
        setManufacturingDate(d.toISOString().split("T")[0]);
      } else {
        setManufacturingDate("");
      }
      setPurchaseRate(
        batch.purchaseRate !== null && batch.purchaseRate !== undefined
          ? String(batch.purchaseRate)
          : ""
      );
      setMrp(batch.mrp ? String(batch.mrp) : "");
    }
  }, [batch]);

  if (!batch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!batchNumber.trim()) {
      toast.error("Batch Number is required.");
      return;
    }

    if (!expiryDate) {
      toast.error("Expiry Date is required.");
      return;
    }

    const mrpNum = Number.parseFloat(mrp);
    if (isNaN(mrpNum) || mrpNum <= 0) {
      toast.error("MRP must be greater than 0.");
      return;
    }

    const pRateNum = purchaseRate ? Number.parseFloat(purchaseRate) : null;
    if (pRateNum !== null && (isNaN(pRateNum) || pRateNum < 0)) {
      toast.error("Purchase Rate cannot be negative.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateBatchDetails({
        batchId: batch.id,
        batchNumber: batchNumber.trim().toUpperCase(),
        expiryDate: new Date(expiryDate).toISOString(),
        manufacturingDate: manufacturingDate
          ? new Date(manufacturingDate).toISOString()
          : null,
        purchaseRate: pRateNum,
        mrp: mrpNum,
      });

      if (res.success) {
        toast.success(`Batch ${batchNumber.toUpperCase()} updated successfully!`);
        onUpdated?.();
        onClose();
      } else {
        toast.error(res.error || "Failed to update batch.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
                <Edit3 className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Edit Batch Information
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Update batch number, expiration date, or pricing.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-3.5 text-sm">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
              <span className="text-[11px] font-medium text-zinc-500">Medicine:</span>{" "}
              <span className="font-bold text-zinc-900">{batch.medicineName}</span>
              <div className="text-[11px] text-zinc-500">
                Current Stock: <span className="font-semibold text-zinc-800">{batch.stockQuantity} units</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-batch-num" className="text-xs font-semibold">
                Batch Number
              </Label>
              <Input
                id="edit-batch-num"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                placeholder="e.g., BATCH-1049"
                className="font-mono uppercase text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-mfg-date" className="text-xs font-semibold">
                  Mfg Date (Optional)
                </Label>
                <Input
                  id="edit-mfg-date"
                  type="date"
                  value={manufacturingDate}
                  onChange={(e) => setManufacturingDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-exp-date" className="text-xs font-semibold">
                  Expiry Date *
                </Label>
                <Input
                  id="edit-exp-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="text-xs font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-prate" className="text-xs font-semibold">
                  Purchase Rate (₹)
                </Label>
                <Input
                  id="edit-prate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(e.target.value)}
                  className="text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-mrp" className="text-xs font-semibold">
                  MRP (₹) *
                </Label>
                <Input
                  id="edit-mrp"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="text-sm font-semibold"
                  required
                />
              </div>
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
              disabled={isLoading}
              className="text-xs font-semibold"
            >
              {isLoading && <Loader2 className="mr-2 size-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
