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

interface MedicinesClientProps {
  initialMedicines: Medicine[];
  isAdmin: boolean;
}

export function MedicinesClient({
  initialMedicines,
  isAdmin,
}: MedicinesClientProps) {
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
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

  // Filtering logic
  const filteredMedicines = initialMedicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.manufacturer &&
        med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === "ALL" || med.category.toUpperCase() === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleAdd = async (values: MedicineFormValues) => {
    setIsLoading(true);
    const res = await createMedicine(values);
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
    const res = await updateMedicine(editingMedicine.id, values);
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
        <button className="border-black border-b-2 px-4 py-2 text-black">
          All Medicines
        </button>
        <button
          className="px-4 py-2 transition-colors hover:text-black"
          disabled
        >
          Categories (Soon)
        </button>
        <button
          className="px-4 py-2 transition-colors hover:text-black"
          disabled
        >
          Manufacturers (Soon)
        </button>
        <button
          className="px-4 py-2 transition-colors hover:text-black"
          disabled
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
            placeholder="Search by name, formula, or manufacturer..."
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
                    HSN
                  </TableHead>
                  <TableHead className="py-3 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    GST
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
                      {med.name}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-650">
                      {med.genericName}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-600">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-800">
                        {med.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-zinc-650">
                      {med.manufacturer}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-500">
                      {med.hsn || "—"}
                    </TableCell>
                    <TableCell className="font-semibold text-zinc-800">
                      {med.gst}%
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
        <DialogContent className="max-w-lg rounded-xl border border-zinc-200 bg-white shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg text-zinc-900">
              Add New Medicine
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Add a new record to the medicines database. This code will
              represent a product item master.
            </DialogDescription>
          </DialogHeader>
          <MedicineForm
            isLoading={isLoading}
            onSubmit={handleAdd}
            submitLabel="Create Medicine"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Medicine Dialog */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) setEditingMedicine(null);
        }}
        open={editingMedicine !== null}
      >
        <DialogContent className="max-w-lg rounded-xl border border-zinc-200 bg-white shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg text-zinc-900">
              Edit Medicine
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Update details for {editingMedicine?.name || "medicine"}.
            </DialogDescription>
          </DialogHeader>
          {editingMedicine && (
            <MedicineForm
              defaultValues={{
                name: editingMedicine.name,
                genericName: editingMedicine.genericName,
                category: editingMedicine.category,
                manufacturer: editingMedicine.manufacturer,
                hsn: editingMedicine.hsn || "",
                gst: editingMedicine.gst,
                mrp: editingMedicine.mrp,
                status: editingMedicine.status as "ACTIVE" | "INACTIVE",
              }}
              isLoading={isLoading}
              onSubmit={handleEdit}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog (Accessible to both Admin & Staff) */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) setViewingMedicine(null);
        }}
        open={viewingMedicine !== null}
      >
        <DialogContent className="max-w-md rounded-xl border border-zinc-200 bg-white shadow-xl">
          <DialogHeader className="border-zinc-100 border-b pb-3">
            <DialogTitle className="flex items-center gap-2 font-extrabold text-xl text-zinc-900">
              <Pill className="size-5 text-black" />
              {viewingMedicine?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Full specifications from product master directory.
            </DialogDescription>
          </DialogHeader>
          {viewingMedicine && (
            <div className="space-y-4 pt-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block font-bold text-[10px] text-zinc-450 uppercase tracking-wider">
                    Formula / Generic
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {viewingMedicine.genericName}
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-[10px] text-zinc-450 uppercase tracking-wider">
                    Category
                  </span>
                  <span className="mt-0.5 inline-block rounded bg-zinc-100 px-2 py-0.5 font-semibold text-xs text-zinc-800">
                    {viewingMedicine.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block font-bold text-[10px] text-zinc-450 uppercase tracking-wider">
                    Manufacturer
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {viewingMedicine.manufacturer}
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-[10px] text-zinc-450 uppercase tracking-wider">
                    HSN Code
                  </span>
                  <span className="font-mono text-zinc-800">
                    {viewingMedicine.hsn || "—"}
                  </span>
                </div>
              </div>

              <div className="-mx-6 grid grid-cols-3 gap-2 border-zinc-100 border-t border-b bg-zinc-50/50 px-6 py-3">
                <div>
                  <span className="block font-bold text-[10px] text-zinc-400 uppercase tracking-wider">
                    GST Rate
                  </span>
                  <span className="font-extrabold text-base text-zinc-900">
                    {viewingMedicine.gst}%
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-[10px] text-zinc-400 uppercase tracking-wider">
                    MRP
                  </span>
                  <span className="font-extrabold text-base text-zinc-900">
                    ₹{viewingMedicine.mrp.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-[10px] text-zinc-400 uppercase tracking-wider">
                    Status
                  </span>
                  <Badge className="mt-1 bg-black font-bold text-[9px] text-white">
                    {viewingMedicine.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1 text-xs text-zinc-400">
                <div>
                  <span>Added On:</span>{" "}
                  <span className="font-medium text-zinc-600">
                    {new Date(viewingMedicine.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span>Last Updated:</span>{" "}
                  <span className="font-medium text-zinc-600">
                    {new Date(viewingMedicine.updatedAt).toLocaleDateString()}
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
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) setDeletingMedicine(null);
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
                ? This action deletes the product specification from the
                directory permanently. This cannot be undone.
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
