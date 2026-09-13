"use client";

import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Edit,
  Eye,
  Filter,
  Layers,
  Package,
  PackagePlus,
  Pill,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AddBatchDialog } from "@/components/billing/add-batch-dialog";
import {
  MedicineForm,
  type MedicineFormValues,
} from "@/components/forms/medicine-form";
import { InventorySummaryCards } from "@/components/medicines/inventory-summary-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Medicine } from "@/db/schema";
import {
  calculateInventoryStatus,
  formatExpiryCountdown,
  type InventoryStatusInfo,
} from "@/lib/inventory-utils";
import { cn } from "@/lib/utils";
import {
  createMedicine,
  deleteMedicine,
  updateMedicine,
  type MedicineWithBatches,
} from "@/server/medicines";
import * as DialogPrimitive from "@radix-ui/react-dialog";

function MedicineDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-y-0 left-0 md:left-64 right-0 z-50 bg-black/40 data-[state=closed]:animate-out data-[state=open]:animate-in duration-200",
        className
      )}
      {...props}
    />
  );
}

function MedicineDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <MedicineDialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] md:left-[calc(50%+8rem)] z-50 grid w-[90%] max-w-[1000px] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border bg-background p-0 shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in overflow-hidden max-h-[90vh]",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-6 right-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

interface MedicinesClientProps {
  initialMedicines: MedicineWithBatches[];
  isAdmin: boolean;
}

export function MedicinesClient({
  initialMedicines,
  isAdmin,
}: MedicinesClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [viewingMedicine, setViewingMedicine] = useState<
    (MedicineWithBatches & { inventory: InventoryStatusInfo }) | null
  >(null);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(null);
  const [restockingMedicine, setRestockingMedicine] = useState<Medicine | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Compute live inventory status for all medicines
  const medicinesWithStatus = useMemo(() => {
    return initialMedicines.map((med) => {
      const inventory = calculateInventoryStatus(med, med.batches || []);
      return {
        ...med,
        inventory,
      };
    });
  }, [initialMedicines]);

  // Derive inventory category metrics for cards and tabs
  const counts = useMemo(() => {
    let lowStock = 0;
    let expiringSoon = 0;
    let expired = 0;
    let outOfStock = 0;

    for (const item of medicinesWithStatus) {
      if (item.inventory.status === "EXPIRED") expired++;
      else if (item.inventory.status === "OUT_OF_STOCK") outOfStock++;
      else if (item.inventory.status === "EXPIRING_SOON") expiringSoon++;
      else if (item.inventory.status === "LOW_STOCK") lowStock++;
    }

    return {
      total: medicinesWithStatus.length,
      lowStock,
      expiringSoon,
      expired,
      outOfStock,
    };
  }, [medicinesWithStatus]);

  // Derive unique categories for dropdown filter
  const categories = useMemo(() => {
    return [
      "ALL",
      ...Array.from(
        new Set(initialMedicines.map((m) => m.category.toUpperCase()))
      ),
    ];
  }, [initialMedicines]);

  // Unified Filtering: Tab + Category + Search Keyword
  const filteredMedicines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return medicinesWithStatus.filter((item) => {
      // 1. Tab Status Filter
      if (activeTab === "LOW_STOCK" && item.inventory.status !== "LOW_STOCK") {
        return false;
      }
      if (
        activeTab === "EXPIRING_SOON" &&
        item.inventory.status !== "EXPIRING_SOON"
      ) {
        return false;
      }
      if (activeTab === "EXPIRED" && item.inventory.status !== "EXPIRED") {
        return false;
      }
      if (
        activeTab === "OUT_OF_STOCK" &&
        item.inventory.status !== "OUT_OF_STOCK"
      ) {
        return false;
      }

      // 2. Category Dropdown Filter
      if (
        categoryFilter !== "ALL" &&
        item.category.toUpperCase() !== categoryFilter
      ) {
        return false;
      }

      // 3. Search Query: Matches name, generic, brand, manufacturer, barcode, HSN, shortName, batch numbers
      if (query) {
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesGeneric = item.genericName.toLowerCase().includes(query);
        const matchesManufacturer = item.manufacturer
          .toLowerCase()
          .includes(query);
        const matchesBrand =
          item.brand?.toLowerCase().includes(query) ?? false;
        const matchesShort =
          item.shortName?.toLowerCase().includes(query) ?? false;
        const matchesBarcode =
          item.barcode?.toLowerCase().includes(query) ?? false;
        const matchesHsn = item.hsn?.toLowerCase().includes(query) ?? false;
        const matchesBatch =
          item.batches?.some((b) =>
            b.batchNumber.toLowerCase().includes(query)
          ) ?? false;

        if (
          !matchesName &&
          !matchesGeneric &&
          !matchesManufacturer &&
          !matchesBrand &&
          !matchesShort &&
          !matchesBarcode &&
          !matchesHsn &&
          !matchesBatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [medicinesWithStatus, activeTab, categoryFilter, searchQuery]);

  const handleAdd = async (values: MedicineFormValues) => {
    setIsLoading(true);
    const res = await createMedicine({
      ...values,
      prescriptionRequired: values.prescriptionRequired ?? false,
    });
    setIsLoading(false);

    if (res.success) {
      toast.success("Medicine added successfully");
      setIsAddOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to add medicine");
    }
  };

  const handleEdit = async (values: MedicineFormValues) => {
    if (!editingMedicine) return;

    setIsLoading(true);
    const res = await updateMedicine(editingMedicine.id, {
      ...values,
      prescriptionRequired: values.prescriptionRequired ?? false,
    });
    setIsLoading(false);

    if (res.success) {
      toast.success("Medicine updated successfully");
      setEditingMedicine(null);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update medicine");
    }
  };

  const handleDelete = async () => {
    if (!deletingMedicine) return;

    setIsLoading(true);
    const res = await deleteMedicine(deletingMedicine.id);
    setIsLoading(false);

    if (res.success) {
      toast.success("Medicine deleted successfully");
      setDeletingMedicine(null);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete medicine");
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-zinc-50/50 p-6 text-zinc-950 md:p-10">
      {/* Title & Top Header */}
      <div className="flex flex-col gap-4 border-zinc-200 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
            Pharmacy Inventory Master
          </span>
          <h1 className="mt-1 font-extrabold text-3xl text-zinc-900 tracking-tight">
            Medicines & Stock
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Monitor real-time inventory levels, FEFO expiry tracking, and restock
            demands.
          </p>
        </div>
        {isAdmin && (
          <Button
            className="flex items-center gap-1.5 bg-zinc-950 font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="size-4" />
            Add Medicine
          </Button>
        )}
      </div>

      {/* Dashboard Summary Cards */}
      <InventorySummaryCards
        counts={counts}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Inventory Status Tabs */}
      <div className="flex select-none gap-2 overflow-x-auto border-zinc-200 border-b pb-px font-semibold text-xs text-zinc-500">
        <button
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors",
            activeTab === "ALL"
              ? "border-zinc-900 text-zinc-950 font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          )}
          onClick={() => setActiveTab("ALL")}
          type="button"
        >
          <span>All Medicines</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px]",
              activeTab === "ALL"
                ? "bg-zinc-900 font-bold text-white"
                : "bg-zinc-100 text-zinc-600"
            )}
          >
            {counts.total}
          </span>
        </button>

        <button
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors",
            activeTab === "LOW_STOCK"
              ? "border-orange-500 text-orange-700 font-bold"
              : "border-transparent text-zinc-500 hover:text-orange-600"
          )}
          onClick={() => setActiveTab("LOW_STOCK")}
          type="button"
        >
          <span>Low Stock</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px]",
              activeTab === "LOW_STOCK"
                ? "bg-orange-600 font-bold text-white"
                : counts.lowStock > 0
                ? "bg-orange-100 font-bold text-orange-800"
                : "bg-zinc-100 text-zinc-600"
            )}
          >
            {counts.lowStock}
          </span>
        </button>

        <button
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors",
            activeTab === "EXPIRING_SOON"
              ? "border-amber-500 text-amber-800 font-bold"
              : "border-transparent text-zinc-500 hover:text-amber-700"
          )}
          onClick={() => setActiveTab("EXPIRING_SOON")}
          type="button"
        >
          <span>Expiring Soon</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px]",
              activeTab === "EXPIRING_SOON"
                ? "bg-amber-600 font-bold text-white"
                : counts.expiringSoon > 0
                ? "bg-amber-100 font-bold text-amber-800"
                : "bg-zinc-100 text-zinc-600"
            )}
          >
            {counts.expiringSoon}
          </span>
        </button>

        <button
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors",
            activeTab === "EXPIRED"
              ? "border-red-600 text-red-700 font-bold"
              : "border-transparent text-zinc-500 hover:text-red-600"
          )}
          onClick={() => setActiveTab("EXPIRED")}
          type="button"
        >
          <span>Expired</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px]",
              activeTab === "EXPIRED"
                ? "bg-red-600 font-bold text-white"
                : counts.expired > 0
                ? "bg-red-100 font-bold text-red-800"
                : "bg-zinc-100 text-zinc-600"
            )}
          >
            {counts.expired}
          </span>
        </button>

        <button
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors",
            activeTab === "OUT_OF_STOCK"
              ? "border-zinc-800 text-zinc-950 font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          )}
          onClick={() => setActiveTab("OUT_OF_STOCK")}
          type="button"
        >
          <span>Out of Stock</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px]",
              activeTab === "OUT_OF_STOCK"
                ? "bg-zinc-800 font-bold text-white"
                : counts.outOfStock > 0
                ? "bg-zinc-200 font-bold text-zinc-700"
                : "bg-zinc-100 text-zinc-600"
            )}
          >
            {counts.outOfStock}
          </span>
        </button>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            className="border-zinc-200 bg-white pl-9 focus:border-zinc-900 text-sm"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, generic, brand, batch number, barcode, HSN..."
            value={searchQuery}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 shrink-0 text-zinc-400" />
          <select
            className="h-10 min-w-[150px] rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:outline-zinc-900"
            onChange={(e) => setCategoryFilter(e.target.value)}
            value={categoryFilter}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "All Categories" : cat}
              </option>
            ))}
          </select>
          {(searchQuery || categoryFilter !== "ALL" || activeTab !== "ALL") && (
            <Button
              className="h-10 text-xs text-zinc-500 hover:text-black"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("ALL");
                setActiveTab("ALL");
              }}
              variant="ghost"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Medicines Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs">
        {filteredMedicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Pill className="mb-3 size-12 stroke-[1.5] text-zinc-300" />
            <h3 className="font-extrabold text-base text-zinc-800">
              No medicines found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              {searchQuery || categoryFilter !== "ALL" || activeTab !== "ALL"
                ? "No products match the selected tab and filter criteria."
                : "The medicine catalog is empty. Click the button above to add your first medicine."}
            </p>
            {activeTab !== "ALL" && (
              <Button
                className="mt-4 border-zinc-200 text-xs"
                onClick={() => setActiveTab("ALL")}
                variant="outline"
              >
                View All Medicines
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/70 border-b border-zinc-200">
                <TableRow>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Medicine Name
                  </TableHead>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Generic Name
                  </TableHead>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Manufacturer
                  </TableHead>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Batch
                  </TableHead>
                  <TableHead className="py-3 text-right font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Purchase Price
                  </TableHead>
                  <TableHead className="py-3 text-right font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Selling (MRP)
                  </TableHead>
                  <TableHead className="py-3 text-center font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Stock
                  </TableHead>
                  <TableHead className="py-3 text-center font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Min Stock
                  </TableHead>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Expiry Date
                  </TableHead>
                  <TableHead className="py-3 text-center font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="py-3 text-right font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((med) => {
                  const inv = med.inventory;
                  const activeBatch = inv.activeBatch;
                  const expiryCountdown = formatExpiryCountdown(
                    inv.daysUntilExpiry
                  );
                  const minStock =
                    med.minimumQuantity ?? med.reorderLevel ?? 0;

                  // Purchase rate determination: batch purchaseRate > med pRate > med cost
                  const purchaseRate =
                    activeBatch?.purchaseRate ?? med.pRate ?? med.cost;

                  const isLowOrOut =
                    inv.status === "LOW_STOCK" || inv.status === "OUT_OF_STOCK";

                  return (
                    <TableRow
                      className="border-zinc-150 border-b transition-colors hover:bg-zinc-50/50"
                      key={med.id}
                    >
                      {/* Medicine Name */}
                      <TableCell className="font-bold text-zinc-950 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="leading-snug">{med.name}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-normal">
                            {med.brand && <span>{med.brand}</span>}
                            {med.brand && med.packing && <span>•</span>}
                            <span>{med.packing}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Generic Name */}
                      <TableCell className="font-medium text-xs text-zinc-650 max-w-[160px] truncate py-3">
                        {med.genericName}
                      </TableCell>

                      {/* Manufacturer */}
                      <TableCell className="font-medium text-xs text-zinc-600 max-w-[140px] truncate py-3">
                        {med.manufacturer}
                      </TableCell>

                      {/* Batch Number */}
                      <TableCell className="py-3">
                        {activeBatch ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-semibold text-xs text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded">
                              {activeBatch.batchNumber}
                            </span>
                            {med.batches.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setViewingMedicine(med)}
                                className="font-medium text-[10px] text-zinc-400 hover:text-zinc-700 underline decoration-dotted"
                                title="View all batches"
                              >
                                +{med.batches.length - 1} more
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-zinc-400">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Purchase Price */}
                      <TableCell className="text-right font-medium text-xs text-zinc-600 py-3">
                        {purchaseRate !== null && purchaseRate !== undefined ? (
                          `₹${purchaseRate.toFixed(2)}`
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </TableCell>

                      {/* Selling Price (MRP) */}
                      <TableCell className="text-right font-extrabold text-xs text-zinc-950 py-3">
                        ₹{med.mrp.toFixed(2)}
                      </TableCell>

                      {/* Current Stock */}
                      <TableCell className="text-center py-3">
                        <div className="flex flex-col items-center justify-center">
                          <span
                            className={cn(
                              "font-black text-sm",
                              inv.unexpiredStock === 0
                                ? "text-red-600"
                                : inv.status === "LOW_STOCK"
                                ? "text-orange-600"
                                : "text-zinc-950"
                            )}
                          >
                            {inv.unexpiredStock}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {med.conversionFactor > 1
                              ? `${Math.floor(
                                  inv.unexpiredStock / med.conversionFactor
                                )} pk (${inv.unexpiredStock % med.conversionFactor}u)`
                              : "units"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Minimum Stock */}
                      <TableCell className="text-center font-medium text-xs text-zinc-500 py-3">
                        {minStock > 0 ? (
                          <span>{minStock}</span>
                        ) : (
                          <span className="text-zinc-300">0</span>
                        )}
                      </TableCell>

                      {/* Expiry Date */}
                      <TableCell className="py-3">
                        {inv.nearestExpiryDate ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-xs text-zinc-850">
                              {new Date(
                                inv.nearestExpiryDate
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span
                              className={cn(
                                "w-fit rounded border px-1.5 py-0.2 text-[10px]",
                                expiryCountdown.className
                              )}
                            >
                              {expiryCountdown.text}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 font-medium">
                            No active batch
                          </span>
                        )}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="text-center py-3">
                        <Badge
                          className={cn(
                            "px-2 py-0.5 text-[10px] uppercase tracking-wide",
                            inv.badgeClassName
                          )}
                          variant="outline"
                        >
                          {inv.label}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Direct Restock Button */}
                          {isLowOrOut ? (
                            <Button
                              className="h-7 bg-orange-600 px-2.5 font-bold text-[11px] text-white shadow-xs hover:bg-orange-700 transition-colors"
                              onClick={() => setRestockingMedicine(med)}
                              size="sm"
                            >
                              <Plus className="mr-1 size-3" />
                              Restock
                            </Button>
                          ) : (
                            <Button
                              className="size-7 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                              onClick={() => setRestockingMedicine(med)}
                              size="icon"
                              title="Add Stock / Batch"
                              variant="ghost"
                            >
                              <PackagePlus className="size-3.5" />
                            </Button>
                          )}

                          <Button
                            className="size-7 text-zinc-500 hover:bg-zinc-100 hover:text-black"
                            onClick={() => setViewingMedicine(med)}
                            size="icon"
                            title="View Details"
                            variant="ghost"
                          >
                            <Eye className="size-3.5" />
                          </Button>

                          {isAdmin && (
                            <>
                              <Button
                                className="size-7 text-zinc-500 hover:bg-zinc-100 hover:text-black"
                                onClick={() => setEditingMedicine(med)}
                                size="icon"
                                title="Edit Medicine"
                                variant="ghost"
                              >
                                <Edit className="size-3.5" />
                              </Button>
                              <Button
                                className="size-7 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                                onClick={() => setDeletingMedicine(med)}
                                size="icon"
                                title="Delete Medicine"
                                variant="ghost"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ==========================================
          MODALS / SHEETS
         ========================================== */}

      {/* Restock / Add Batch Dialog */}
      <AddBatchDialog
        isOpen={restockingMedicine !== null}
        medicine={
          restockingMedicine
            ? {
                id: restockingMedicine.id,
                name: restockingMedicine.name,
                mrp: restockingMedicine.mrp,
                packing: restockingMedicine.packing,
              }
            : null
        }
        onBatchAdded={(_batchId) => {
          setRestockingMedicine(null);
          router.refresh();
        }}
        onClose={() => setRestockingMedicine(null)}
      />

      {/* Add Medicine Dialog */}
      <Dialog onOpenChange={setIsAddOpen} open={isAddOpen}>
        <MedicineDialogContent>
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="font-extrabold text-xl text-zinc-900">
              Add New Medicine
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Complete the steps below to register a new product in the inventory.
            </DialogDescription>
          </DialogHeader>
          <MedicineForm
            isLoading={isLoading}
            onCancel={() => setIsAddOpen(false)}
            onSubmit={handleAdd}
            submitLabel="Create Medicine"
          />
        </MedicineDialogContent>
      </Dialog>

      {/* Edit Medicine Dialog */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setEditingMedicine(null);
          }
        }}
        open={editingMedicine !== null}
      >
        <MedicineDialogContent>
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="font-extrabold text-xl text-zinc-900">
              Edit Medicine
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Complete the steps below to update the product details in the
              inventory.
            </DialogDescription>
          </DialogHeader>
          {editingMedicine && (
            <MedicineForm
              defaultValues={{
                name: editingMedicine.name,
                shortName: editingMedicine.shortName || "",
                genericName: editingMedicine.genericName,
                manufacturer: editingMedicine.manufacturer,
                brand: editingMedicine.brand || "",
                category: editingMedicine.category,
                productType: editingMedicine.productType || "",
                packing: editingMedicine.packing,
                quantityVolume: editingMedicine.quantityVolume || "",
                uqcUnit: editingMedicine.uqcUnit || "",
                conversionFactor: editingMedicine.conversionFactor,
                hsn: editingMedicine.hsn || "",
                gst: editingMedicine.gst,
                cess: editingMedicine.cess ?? 0,
                mrp: editingMedicine.mrp,
                pRate: editingMedicine.pRate ?? undefined,
                cost: editingMedicine.cost ?? undefined,
                rateA: editingMedicine.rateA ?? undefined,
                rateB: editingMedicine.rateB ?? undefined,
                rateC: editingMedicine.rateC ?? undefined,
                minimumQuantity: editingMedicine.minimumQuantity ?? 0,
                maximumQuantity: editingMedicine.maximumQuantity ?? undefined,
                reorderLevel: editingMedicine.reorderLevel ?? undefined,
                reorderQuantity: editingMedicine.reorderQuantity ?? undefined,
                barcode: editingMedicine.barcode || "",
                drugSchedule: editingMedicine.drugSchedule || "",
                prescriptionRequired:
                  editingMedicine.prescriptionRequired ?? false,
                storageCondition: editingMedicine.storageCondition || "",
                status: editingMedicine.status as "ACTIVE" | "INACTIVE",
              }}
              isLoading={isLoading}
              onCancel={() => setEditingMedicine(null)}
              onSubmit={handleEdit}
              submitLabel="Save Changes"
            />
          )}
        </MedicineDialogContent>
      </Dialog>

      {/* View Details Dialog with Batches Breakdown */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setViewingMedicine(null);
          }
        }}
        open={viewingMedicine !== null}
      >
        <MedicineDialogContent>
          <DialogHeader className="p-6 pb-4 border-zinc-150 border-b bg-[#f8f9fc]">
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle className="flex items-center gap-2 font-extrabold text-xl text-zinc-900">
                  <Pill className="size-5 text-black" />
                  {viewingMedicine?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Full specifications and batch stock inventory.
                </DialogDescription>
              </div>
              {viewingMedicine && (
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-1 uppercase tracking-wider font-bold",
                    viewingMedicine.inventory.badgeClassName
                  )}
                  variant="outline"
                >
                  {viewingMedicine.inventory.label}
                </Badge>
              )}
            </div>
          </DialogHeader>
          {viewingMedicine && (
            <div className="p-6 max-h-[65vh] space-y-6 overflow-y-auto text-sm">
              {/* Batch Inventory Breakdown Table */}
              <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-zinc-700" />
                    <span className="font-bold text-xs text-zinc-900 uppercase tracking-wider">
                      Batch Inventory ({viewingMedicine.batches.length})
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-zinc-900 text-white hover:bg-zinc-800"
                    onClick={() => {
                      const target = viewingMedicine;
                      setViewingMedicine(null);
                      setRestockingMedicine(target);
                    }}
                  >
                    <Plus className="mr-1 size-3" />
                    Add New Batch
                  </Button>
                </div>

                {viewingMedicine.batches.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">
                    No active batches registered for this medicine yet. Click "Add New Batch" to restock.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
                    <Table>
                      <TableHeader className="bg-zinc-100/70">
                        <TableRow>
                          <TableHead className="py-2 text-[10px] font-bold text-zinc-600 uppercase">
                            Batch #
                          </TableHead>
                          <TableHead className="py-2 text-[10px] font-bold text-zinc-600 uppercase">
                            Expiry Date
                          </TableHead>
                          <TableHead className="py-2 text-center text-[10px] font-bold text-zinc-600 uppercase">
                            Days Left
                          </TableHead>
                          <TableHead className="py-2 text-right text-[10px] font-bold text-zinc-600 uppercase">
                            Stock Qty
                          </TableHead>
                          <TableHead className="py-2 text-right text-[10px] font-bold text-zinc-600 uppercase">
                            Purchase Rate
                          </TableHead>
                          <TableHead className="py-2 text-right text-[10px] font-bold text-zinc-600 uppercase">
                            MRP
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingMedicine.batches.map((batch) => {
                          const now = new Date();
                          const today = new Date(
                            now.getFullYear(),
                            now.getMonth(),
                            now.getDate()
                          );
                          const exp = batch.expiryDate
                            ? new Date(batch.expiryDate)
                            : null;
                          const diffDays = exp
                            ? Math.ceil(
                                (exp.getTime() - today.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : null;
                          const countdown = formatExpiryCountdown(diffDays);

                          return (
                            <TableRow key={batch.id} className="text-xs">
                              <TableCell className="font-mono font-bold text-zinc-900 py-2">
                                {batch.batchNumber}
                              </TableCell>
                              <TableCell className="py-2 text-zinc-700">
                                {exp
                                  ? exp.toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-center py-2">
                                <span
                                  className={cn(
                                    "rounded px-1.5 py-0.5 text-[10px] border",
                                    countdown.className
                                  )}
                                >
                                  {countdown.text}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-black py-2 text-zinc-900">
                                {batch.stockQuantity}
                              </TableCell>
                              <TableCell className="text-right py-2 text-zinc-600">
                                {batch.purchaseRate !== null &&
                                batch.purchaseRate !== undefined
                                  ? `₹${batch.purchaseRate.toFixed(2)}`
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right font-bold py-2 text-zinc-950">
                                ₹{batch.mrp.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Visual Section 1: Basic Info */}
              <div className="space-y-3">
                <span className="block border-zinc-100 border-b pb-1 font-bold text-xs text-zinc-400 uppercase tracking-wider">
                  Basic Information
                </span>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Formula / Generic
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {viewingMedicine.genericName}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Category
                    </span>
                    <span className="mt-0.5 inline-block rounded bg-zinc-100 px-2 py-0.5 font-semibold text-xs text-zinc-800">
                      {viewingMedicine.category}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Manufacturer
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {viewingMedicine.manufacturer}
                    </span>
                  </div>
                  {viewingMedicine.shortName && (
                    <div>
                      <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                        Short Name
                      </span>
                      <span className="font-semibold text-zinc-900">
                        {viewingMedicine.shortName}
                      </span>
                    </div>
                  )}
                  {viewingMedicine.brand && (
                    <div>
                      <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                        Brand
                      </span>
                      <span className="font-semibold text-zinc-900">
                        {viewingMedicine.brand}
                      </span>
                    </div>
                  )}
                  {viewingMedicine.productType && (
                    <div>
                      <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                        Product Type
                      </span>
                      <span className="font-semibold text-zinc-900">
                        {viewingMedicine.productType}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Section 2: Packaging */}
              <div className="space-y-3 pt-2">
                <span className="block border-zinc-100 border-b pb-1 font-bold text-xs text-zinc-400 uppercase tracking-wider">
                  Packaging & Conversion
                </span>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Packing
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {viewingMedicine.packing}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Quantity / Volume
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {viewingMedicine.quantityVolume || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      UQC / Unit
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {viewingMedicine.uqcUnit || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Conversion Factor
                    </span>
                    <span className="font-extrabold text-zinc-900">
                      {viewingMedicine.conversionFactor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Section 3: Tax & Pricing */}
              <div className="space-y-3 pt-2">
                <span className="block border-zinc-100 border-b pb-1 font-bold text-xs text-zinc-400 uppercase tracking-wider">
                  Tax & Pricing
                </span>
                <div className="grid grid-cols-3 gap-4 rounded-lg border border-zinc-100 bg-zinc-50 p-3 md:grid-cols-4">
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      GST Rate
                    </span>
                    <span className="font-extrabold text-sm text-zinc-900">
                      {viewingMedicine.gst}%
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      CESS
                    </span>
                    <span className="font-extrabold text-sm text-zinc-900">
                      {viewingMedicine.cess}%
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      HSN Code
                    </span>
                    <span className="font-mono text-xs text-zinc-800">
                      {viewingMedicine.hsn || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      MRP (₹)
                    </span>
                    <span className="font-extrabold text-sm text-zinc-900">
                      ₹{viewingMedicine.mrp.toFixed(2)}
                    </span>
                  </div>
                  {viewingMedicine.pRate !== null && (
                    <div>
                      <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                        P Rate
                      </span>
                      <span className="font-semibold text-zinc-900">
                        ₹{viewingMedicine.pRate.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {viewingMedicine.cost !== null && (
                    <div>
                      <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                        Cost
                      </span>
                      <span className="font-semibold text-zinc-900">
                        ₹{viewingMedicine.cost.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Section 4: Inventory Rules */}
              <div className="space-y-3 pt-2">
                <span className="block border-zinc-100 border-b pb-1 font-bold text-xs text-zinc-400 uppercase tracking-wider">
                  Inventory Rules
                </span>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Min Quantity
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {viewingMedicine.minimumQuantity ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Max Quantity
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {viewingMedicine.maximumQuantity ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Reorder Level
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {viewingMedicine.reorderLevel ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Reorder Qty
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {viewingMedicine.reorderQuantity ?? "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-zinc-100 border-t pt-4">
                <Button
                  className="bg-black px-5 font-semibold text-white text-xs transition-colors hover:bg-zinc-800"
                  onClick={() => setViewingMedicine(null)}
                >
                  Close Specification
                </Button>
              </div>
            </div>
          )}
        </MedicineDialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setDeletingMedicine(null);
          }
        }}
        open={deletingMedicine !== null}
      >
        <DialogContent className="max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50">
              <AlertCircle className="size-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="font-extrabold text-lg text-zinc-900">
                Remove Medicine Master?
              </DialogTitle>
              <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-bold text-zinc-900">
                  {deletingMedicine?.name}
                </span>
                ?
              </p>
              <p className="mt-1.5 border-amber-500 border-l-2 pl-2 text-xs text-zinc-400 leading-relaxed">
                This action is only available if the medicine has no dependent
                billing, inventory, purchase, or historical records. Otherwise,
                you can set it to INACTIVE.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2 border-zinc-150 border-t pt-4">
            <Button
              className="border-zinc-200 px-4 font-semibold text-xs text-zinc-700 hover:bg-zinc-50 hover:text-black"
              disabled={isLoading}
              onClick={() => setDeletingMedicine(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 px-4 font-semibold text-white text-xs transition-colors hover:bg-red-700"
              disabled={isLoading}
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
