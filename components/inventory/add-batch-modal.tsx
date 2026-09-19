"use client";

import { AlertCircle, Check, Loader2, Plus, Search } from "lucide-react";
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
import { createMedicineBatch } from "@/server/billing";
import type { MedicineWithInventory } from "@/server/inventory";

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: MedicineWithInventory[];
  preselectedMedicineId?: string | null;
  onBatchAdded?: (batchId: string) => void;
}

export function AddBatchModal({
  isOpen,
  onClose,
  medicines,
  preselectedMedicineId,
  onBatchAdded,
}: AddBatchModalProps) {
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [mrp, setMrp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preselectedMedicineId) {
      setSelectedMedicineId(preselectedMedicineId);
    } else if (medicines.length > 0 && !selectedMedicineId) {
      setSelectedMedicineId(medicines[0].id);
    }
  }, [preselectedMedicineId, medicines]);

  const selectedMedicine = medicines.find((m) => m.id === selectedMedicineId);

  useEffect(() => {
    if (selectedMedicine) {
      if (!mrp) {
        setMrp(String(selectedMedicine.mrp));
      }
      if (
        !purchaseRate &&
        (selectedMedicine.pRate || selectedMedicine.cost)
      ) {
        setPurchaseRate(
          String(selectedMedicine.pRate ?? selectedMedicine.cost ?? "")
        );
      }
    }
  }, [selectedMedicineId, selectedMedicine]);

  useEffect(() => {
    if (isOpen && !expiryDate) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setExpiryDate(nextYear.toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicineId) {
      toast.error("Please select a medicine.");
      return;
    }

    if (!batchNumber.trim()) {
      toast.error("Please enter a Batch Number.");
      return;
    }

    if (!expiryDate) {
      toast.error("Please select an Expiry Date.");
      return;
    }

    const exp = new Date(expiryDate);
    if (exp <= new Date()) {
      toast.error("Expiry date must be in the future.");
      return;
    }

    const qty = Number.parseInt(stockQuantity, 10);
    if (isNaN(qty) || qty < 0) {
      toast.error("Stock quantity must be non-negative.");
      return;
    }

    const mrpNum = Number.parseFloat(mrp);
    if (isNaN(mrpNum) || mrpNum <= 0) {
      toast.error("MRP must be greater than 0.");
      return;
    }

    const pRateNum = purchaseRate ? Number.parseFloat(purchaseRate) : null;
    if (pRateNum !== null && (isNaN(pRateNum) || pRateNum < 0)) {
      toast.error("Purchase rate must be non-negative.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await createMedicineBatch({
        medicineId: selectedMedicineId,
        batchNumber: batchNumber.trim().toUpperCase(),
        manufacturingDate: manufacturingDate
          ? new Date(manufacturingDate).toISOString()
          : null,
        expiryDate: new Date(expiryDate).toISOString(),
        stockQuantity: qty,
        purchaseRate: pRateNum !== null ? pRateNum : undefined,
        mrp: mrpNum,
      });

      if (res.success && res.batchId) {
        toast.success(`Batch ${batchNumber.toUpperCase()} added successfully!`);
        onBatchAdded?.(res.batchId);
        onClose();
        setBatchNumber("");
        setManufacturingDate("");
      } else {
        toast.error(res.error || "Failed to add batch.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
                <Plus className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Add Inward Medicine Batch
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Register a new batch with batch number, expiry date, and stock.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-3.5 text-sm">
            {/* Medicine Selection */}
            {!preselectedMedicineId && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">
                  Target Medicine *
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Search medicine by name or generic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50/50 p-1 space-y-1">
                  {filteredMedicines.slice(0, 8).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMedicineId(m.id);
                        setMrp(String(m.mrp));
                        if (m.pRate || m.cost) {
                          setPurchaseRate(String(m.pRate ?? m.cost));
                        }
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                        selectedMedicineId === m.id
                          ? "bg-zinc-900 text-white font-semibold"
                          : "hover:bg-zinc-200/60 text-zinc-800"
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-bold">{m.name}</span>{" "}
                        <span
                          className={`text-[10px] ${
                            selectedMedicineId === m.id
                              ? "text-zinc-300"
                              : "text-zinc-500"
                          }`}
                        >
                          ({m.genericName})
                        </span>
                      </div>
                      <span className="text-[10px] shrink-0 ml-2">
                        ₹{m.mrp}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedMedicine && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-emerald-900">
                    {selectedMedicine.name}
                  </span>
                  <span className="text-emerald-700 text-[11px] block">
                    {selectedMedicine.genericName} &bull; {selectedMedicine.packing}
                  </span>
                </div>
                <span className="font-bold text-emerald-800">
                  MRP: ₹{selectedMedicine.mrp}
                </span>
              </div>
            )}

            {/* Batch Number */}
            <div className="space-y-1">
              <Label htmlFor="batch-number" className="text-xs font-semibold">
                Batch Number *
              </Label>
              <Input
                id="batch-number"
                placeholder="e.g., BN-2026-X01"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                className="font-mono uppercase text-sm font-semibold"
                required
              />
            </div>

            {/* Dates: Manufacturing & Expiry */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="mfg-date" className="text-xs font-semibold">
                  Mfg Date (Optional)
                </Label>
                <Input
                  id="mfg-date"
                  type="date"
                  value={manufacturingDate}
                  onChange={(e) => setManufacturingDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="exp-date" className="text-xs font-semibold">
                  Expiry Date *
                </Label>
                <Input
                  id="exp-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="text-xs font-semibold"
                  required
                />
              </div>
            </div>

            {/* Quantity, Purchase Rate & MRP */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="stock-qty" className="text-xs font-semibold">
                  Stock Units *
                </Label>
                <Input
                  id="stock-qty"
                  type="number"
                  min="0"
                  placeholder="50"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="text-sm font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="p-rate" className="text-xs font-semibold">
                  Purchase Rate (₹)
                </Label>
                <Input
                  id="p-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="mrp" className="text-xs font-semibold">
                  MRP (₹) *
                </Label>
                <Input
                  id="mrp"
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
              disabled={isLoading || !selectedMedicineId}
              className="text-xs font-semibold"
            >
              {isLoading && <Loader2 className="mr-2 size-3.5 animate-spin" />}
              Register Batch & Add Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
