"use client";

import {
  AlertCircle,
  Edit,
  Eye,
  Filter,
  Pill,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  MedicineForm,
  type MedicineFormValues,
} from "@/components/forms/medicine-form";
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
  createMedicine,
  deleteMedicine,
  updateMedicine,
} from "@/server/medicines";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

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
  initialMedicines: Medicine[];
  isAdmin: boolean;
}

export function MedicinesClient({
  initialMedicines,
  isAdmin,
}: MedicinesClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Derive unique categories for filter
  const categories = [
    "ALL",
    ...Array.from(
      new Set(initialMedicines.map((m) => m.category.toUpperCase()))
    ),
  ];

  // Filtering logic: search matches product name, generic, manufacturer, brand, short name, barcode, and HSN
  const filteredMedicines = initialMedicines.filter((med) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      med.name.toLowerCase().includes(query) ||
      med.genericName.toLowerCase().includes(query) ||
      med.manufacturer.toLowerCase().includes(query) ||
      med.brand?.toLowerCase().includes(query) ||
      med.shortName?.toLowerCase().includes(query) ||
      med.barcode?.toLowerCase().includes(query) ||
      med.hsn?.toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === "ALL" || med.category.toUpperCase() === categoryFilter;

    return matchesSearch && matchesCategory;
  });

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
    if (!editingMedicine) {
      return;
    }

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
    if (!deletingMedicine) {
      return;
    }

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
    <div className="min-h-screen space-y-8 bg-zinc-50/50 p-6 text-zinc-950 md:p-10">
      {/* Title & Headers */}
      <div className="flex flex-col gap-4 border-zinc-200 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
            Pharmacy Master
          </span>
          <h1 className="mt-1 font-extrabold text-3xl text-zinc-900 tracking-tight">
            Medicines Master
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            View, search, and manage products inside the medicine master
            catalog.
          </p>
        </div>
        {isAdmin && (
          <Button
            className="flex items-center gap-1.5 bg-black font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="size-4" />
            Add Medicine
          </Button>
        )}
      </div>

      {/* Mini Tabs / Breadcrumbs */}
      <div className="flex select-none gap-2 overflow-x-auto border-zinc-200 border-b pb-px font-semibold text-xs text-zinc-400">
        <button
          className="border-black border-b-2 px-4 py-2 text-black"
          type="button"
        >
          All Medicines
        </button>
        <button
          className="px-4 py-2 transition-colors hover:text-black"
          disabled
          type="button"
        >
          Categories (Soon)
        </button>
        <button
          className="px-4 py-2 transition-colors hover:text-black"
          disabled
          type="button"
        >
          Manufacturers (Soon)
        </button>
        <button
          className="px-4 py-2 transition-colors hover:text-black"
          disabled
          type="button"
        >
          Expiry Logs (Soon)
        </button>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            className="border-zinc-200 bg-white pl-9 focus:border-zinc-900"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, generic, brand, manufacturer, barcode, HSN..."
            value={searchQuery}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 shrink-0 text-zinc-400" />
          <select
            className="h-10 min-w-[140px] rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:outline-zinc-900"
            onChange={(e) => setCategoryFilter(e.target.value)}
            value={categoryFilter}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "All Categories" : cat}
              </option>
            ))}
          </select>
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
              {searchQuery || categoryFilter !== "ALL"
                ? "Try adjusting your filters or search keywords to find the product."
                : "The medicine catalog is empty. Click the button above to add the first medicine."}
            </p>
            {isAdmin && !searchQuery && categoryFilter === "ALL" && (
              <Button
                className="mt-4 bg-zinc-900 px-4 font-semibold text-white text-xs hover:bg-zinc-800"
                onClick={() => setIsAddOpen(true)}
              >
                Add Medicine
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow className="border-zinc-200 border-b">
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Name
                  </TableHead>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Generic Formula
                  </TableHead>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Category
                  </TableHead>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Manufacturer
                  </TableHead>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Packing
                  </TableHead>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Barcode
                  </TableHead>
                  <TableHead className="py-3 text-right font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    MRP
                  </TableHead>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="py-3 text-right font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((med) => (
                  <TableRow
                    className="border-zinc-150 border-b transition-colors hover:bg-zinc-50/20"
                    key={med.id}
                  >
                    <TableCell className="font-bold text-zinc-950">
                      <div>
                        <div>{med.name}</div>
                        {med.brand && (
                          <div className="font-normal text-[10px] text-zinc-400">
                            Brand: {med.brand}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-zinc-650">
                      {med.genericName}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-600">
                      <div className="flex flex-col gap-0.5">
                        <span className="w-fit rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-800">
                          {med.category}
                        </span>
                        {med.productType && (
                          <span className="text-[9px] text-zinc-400">
                            {med.productType}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-zinc-650">
                      {med.manufacturer}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-650">
                      {med.packing}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-500">
                      {med.barcode || "—"}
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-zinc-950">
                      ₹{med.mrp.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          med.status === "ACTIVE"
                            ? "border-transparent bg-zinc-900 px-2 py-0.5 font-bold text-[10px] text-white"
                            : "border-zinc-200 bg-zinc-100 px-2 py-0.5 font-bold text-[10px] text-zinc-500"
                        }
                        variant="outline"
                      >
                        {med.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          className="size-8 text-zinc-500 hover:bg-zinc-100 hover:text-black"
                          onClick={() => setViewingMedicine(med)}
                          size="icon"
                          variant="ghost"
                        >
                          <Eye className="size-4" />
                        </Button>
                        {isAdmin ? (
                          <>
                            <Button
                              className="size-8 text-zinc-500 hover:bg-zinc-100 hover:text-black"
                              onClick={() => setEditingMedicine(med)}
                              size="icon"
                              variant="ghost"
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              className="size-8 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                              onClick={() => setDeletingMedicine(med)}
                              size="icon"
                              variant="ghost"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ==========================================
          MODALS / SHEETS
         ========================================== */}

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
            onSubmit={handleAdd}
            onCancel={() => setIsAddOpen(false)}
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
              Complete the steps below to update the product details in the inventory.
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
              onSubmit={handleEdit}
              onCancel={() => setEditingMedicine(null)}
              submitLabel="Save Changes"
            />
          )}
        </MedicineDialogContent>
      </Dialog>

      {/* View Details Dialog (Accessible to both Admin & Staff) */}
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
            <DialogTitle className="flex items-center gap-2 font-extrabold text-xl text-zinc-900">
              <Pill className="size-5 text-black" />
              {viewingMedicine?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Full specifications from product master directory.
            </DialogDescription>
          </DialogHeader>
          {viewingMedicine && (
            <div className="p-6 max-h-[65vh] space-y-4 overflow-y-auto text-sm">
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
                  {viewingMedicine.rateA !== null && (
                    <div>
                      <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                        Rate A
                      </span>
                      <span className="font-semibold text-zinc-900">
                        ₹{viewingMedicine.rateA.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {viewingMedicine.rateB !== null && (
                    <div>
                      <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                        Rate B
                      </span>
                      <span className="font-semibold text-zinc-900">
                        ₹{viewingMedicine.rateB.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {viewingMedicine.rateC !== null && (
                    <div>
                      <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                        Rate C
                      </span>
                      <span className="font-semibold text-zinc-900">
                        ₹{viewingMedicine.rateC.toFixed(2)}
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
                      {viewingMedicine.minimumQuantity}
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

              {/* Visual Section 5: Pharmacy Info */}
              <div className="space-y-3 pt-2">
                <span className="block border-zinc-100 border-b pb-1 font-bold text-xs text-zinc-400 uppercase tracking-wider">
                  Pharmacy Configuration
                </span>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Barcode
                    </span>
                    <span className="font-mono text-xs text-zinc-800">
                      {viewingMedicine.barcode || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Drug Schedule
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {viewingMedicine.drugSchedule || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Rx Required?
                    </span>
                    <Badge
                      className={
                        viewingMedicine.prescriptionRequired
                          ? "bg-red-500 font-bold text-[9px] text-white hover:bg-red-600"
                          : "bg-zinc-800 font-bold text-[9px] text-white"
                      }
                    >
                      {viewingMedicine.prescriptionRequired ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">
                      Storage Condition
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {viewingMedicine.storageCondition || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-zinc-150 border-t pt-4 text-xs text-zinc-400">
                <div>
                  <span>Added On:</span>{" "}
                  <span className="font-medium text-zinc-650">
                    {new Date(viewingMedicine.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span>Last Updated:</span>{" "}
                  <span className="font-medium text-zinc-650">
                    {new Date(viewingMedicine.updatedAt).toLocaleString()}
                  </span>
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
