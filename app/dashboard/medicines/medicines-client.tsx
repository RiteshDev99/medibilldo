"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Pill,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "@/server/medicines";
import { MedicineForm, MedicineFormValues } from "@/components/forms/medicine-form";
import { Medicine } from "@/db/schema";

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
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Derive unique categories for filter
  const categories = ["ALL", ...Array.from(new Set(initialMedicines.map((m) => m.category.toUpperCase())))];

  // Filtering logic
  const filteredMedicines = initialMedicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.manufacturer && med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()));

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
    <div className="p-6 md:p-10 space-y-8 bg-zinc-50/50 min-h-screen text-zinc-950">
      {/* Title & Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pharmacy Master</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">
            Medicines Master
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            View, search, and manage products inside the medicine master catalog.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-black text-white hover:bg-zinc-800 transition-colors font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            Add Medicine
          </Button>
        )}
      </div>

      {/* Mini Tabs / Breadcrumbs */}
      <div className="flex gap-2 border-b border-zinc-200 pb-px overflow-x-auto text-xs font-semibold text-zinc-400 select-none">
        <button className="px-4 py-2 border-b-2 border-black text-black">
          All Medicines
        </button>
        <button className="px-4 py-2 hover:text-black transition-colors" disabled>
          Categories (Soon)
        </button>
        <button className="px-4 py-2 hover:text-black transition-colors" disabled>
          Manufacturers (Soon)
        </button>
        <button className="px-4 py-2 hover:text-black transition-colors" disabled>
          Expiry Logs (Soon)
        </button>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <Input
            placeholder="Search by name, formula, or manufacturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-zinc-200 focus:border-zinc-900 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-zinc-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-zinc-900 text-zinc-700 min-w-[140px]"
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
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        {filteredMedicines.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Pill className="size-12 text-zinc-300 stroke-[1.5] mb-3" />
            <h3 className="font-extrabold text-base text-zinc-800">No medicines found</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm">
              {searchQuery || categoryFilter !== "ALL"
                ? "Try adjusting your filters or search keywords to find the product."
                : "The medicine catalog is empty. Click the button above to add the first medicine."}
            </p>
            {isAdmin && !searchQuery && categoryFilter === "ALL" && (
              <Button
                onClick={() => setIsAddOpen(true)}
                className="mt-4 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold px-4"
              >
                Add Medicine
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow className="border-b border-zinc-200">
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 py-3">Name</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 py-3">Generic Formula</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 py-3">Category</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 py-3">Manufacturer</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 py-3">HSN</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 py-3">GST</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 py-3 text-right">MRP</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 py-3">Status</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 py-3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((med) => (
                  <TableRow
                    key={med.id}
                    className="hover:bg-zinc-50/20 border-b border-zinc-150 transition-colors"
                  >
                    <TableCell className="font-bold text-zinc-950">{med.name}</TableCell>
                    <TableCell className="font-medium text-zinc-650">{med.genericName}</TableCell>
                    <TableCell className="font-medium text-zinc-600">
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 rounded text-xs">
                        {med.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-zinc-650">{med.manufacturer}</TableCell>
                    <TableCell className="font-mono text-xs text-zinc-500">{med.hsn || "—"}</TableCell>
                    <TableCell className="font-semibold text-zinc-800">{med.gst}%</TableCell>
                    <TableCell className="font-extrabold text-zinc-950 text-right">₹{med.mrp.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          med.status === "ACTIVE"
                            ? "bg-zinc-900 text-white font-bold border-transparent text-[10px] px-2 py-0.5"
                            : "bg-zinc-100 text-zinc-500 font-bold border-zinc-200 text-[10px] px-2 py-0.5"
                        }
                      >
                        {med.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingMedicine(med)}
                          className="size-8 text-zinc-500 hover:text-black hover:bg-zinc-100"
                        >
                          <Eye className="size-4" />
                        </Button>
                        {isAdmin ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingMedicine(med)}
                              className="size-8 text-zinc-500 hover:text-black hover:bg-zinc-100"
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingMedicine(med)}
                              className="size-8 text-zinc-400 hover:text-red-600 hover:bg-red-50"
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
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg bg-white border border-zinc-200 shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 font-extrabold text-lg">Add New Medicine</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Add a new record to the medicines database. This code will represent a product item master.
            </DialogDescription>
          </DialogHeader>
          <MedicineForm onSubmit={handleAdd} isLoading={isLoading} submitLabel="Create Medicine" />
        </DialogContent>
      </Dialog>

      {/* Edit Medicine Dialog */}
      <Dialog
        open={editingMedicine !== null}
        onOpenChange={(open) => {
          if (!open) setEditingMedicine(null);
        }}
      >
        <DialogContent className="max-w-lg bg-white border border-zinc-200 shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 font-extrabold text-lg">Edit Medicine</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Update details for {editingMedicine?.name || "medicine"}.
            </DialogDescription>
          </DialogHeader>
          {editingMedicine && (
            <MedicineForm
              onSubmit={handleEdit}
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
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog (Accessible to both Admin & Staff) */}
      <Dialog
        open={viewingMedicine !== null}
        onOpenChange={(open) => {
          if (!open) setViewingMedicine(null);
        }}
      >
        <DialogContent className="max-w-md bg-white border border-zinc-200 shadow-xl rounded-xl">
          <DialogHeader className="border-b border-zinc-100 pb-3">
            <DialogTitle className="text-zinc-900 font-extrabold text-xl flex items-center gap-2">
              <Pill className="size-5 text-black" />
              {viewingMedicine?.name}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Full specifications from product master directory.
            </DialogDescription>
          </DialogHeader>
          {viewingMedicine && (
            <div className="space-y-4 pt-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Formula / Generic</span>
                  <span className="font-semibold text-zinc-900">{viewingMedicine.genericName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Category</span>
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 font-semibold rounded text-xs inline-block mt-0.5">
                    {viewingMedicine.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Manufacturer</span>
                  <span className="font-semibold text-zinc-900">{viewingMedicine.manufacturer}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">HSN Code</span>
                  <span className="font-mono text-zinc-800">{viewingMedicine.hsn || "—"}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-b border-zinc-100 py-3 bg-zinc-50/50 -mx-6 px-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">GST Rate</span>
                  <span className="font-extrabold text-zinc-900 text-base">{viewingMedicine.gst}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">MRP</span>
                  <span className="font-extrabold text-zinc-900 text-base">₹{viewingMedicine.mrp.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Status</span>
                  <Badge className="bg-black text-white font-bold text-[9px] mt-1">{viewingMedicine.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400 pt-1">
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

              <div className="flex justify-end pt-4 border-t border-zinc-100">
                <Button
                  onClick={() => setViewingMedicine(null)}
                  className="bg-black text-white hover:bg-zinc-800 transition-colors text-xs font-semibold px-5"
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
        open={deletingMedicine !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingMedicine(null);
        }}
      >
        <DialogContent className="max-w-md bg-white border border-zinc-200 shadow-xl rounded-xl p-6">
          <div className="flex gap-3">
            <div className="size-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <AlertCircle className="size-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-zinc-900 font-extrabold text-lg">Remove Medicine Master?</DialogTitle>
              <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-zinc-900">{deletingMedicine?.name}</span>? This action deletes the product specification from the directory permanently. This cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-150">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => setDeletingMedicine(null)}
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-black font-semibold text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 transition-colors"
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
