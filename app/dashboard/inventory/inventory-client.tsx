"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  Package,
  PackageCheck,
  PackagePlus,
  Pill,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  TrendingDown,
  Warehouse,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AddBatchModal } from "@/components/inventory/add-batch-modal";
import { AdjustStockDialog } from "@/components/inventory/adjust-stock-dialog";
import { EditBatchDialog } from "@/components/inventory/edit-batch-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatExpiryCountdown } from "@/lib/inventory-utils";
import {
  deleteBatch,
  type EnrichedBatch,
  type EnrichedMovement,
  type InventoryStats,
  type MedicineWithInventory,
} from "@/server/inventory";

interface InventoryClientProps {
  stats: InventoryStats;
  medicines: MedicineWithInventory[];
  batches: EnrichedBatch[];
  movements: EnrichedMovement[];
  isAdmin: boolean;
}

type TabType = "overview" | "batches" | "low_stock" | "expiry" | "movements";

export function InventoryClient({
  stats: initialStats,
  medicines: initialMedicines,
  batches: initialBatches,
  movements: initialMovements,
  isAdmin,
}: InventoryClientProps) {
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Expanded medicine row IDs for batches view in overview
  const [expandedMedIds, setExpandedMedIds] = useState<Set<string>>(
    new Set()
  );

  // Dialog States
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [targetMedicineForBatch, setTargetMedicineForBatch] = useState<
    string | null
  >(null);

  const [adjustingBatch, setAdjustingBatch] = useState<{
    id: string;
    batchNumber: string;
    medicineName: string;
    stockQuantity: number;
    packing?: string;
  } | null>(null);

  const [editingBatch, setEditingBatch] = useState<{
    id: string;
    batchNumber: string;
    medicineName: string;
    expiryDate: Date | string;
    manufacturingDate?: Date | string | null;
    purchaseRate?: number | null;
    mrp: number;
    stockQuantity: number;
  } | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Inventory refreshed");
    }, 600);
  };

  const toggleExpand = (medId: string) => {
    setExpandedMedIds((prev) => {
      const next = new Set(prev);
      if (next.has(medId)) {
        next.delete(medId);
      } else {
        next.add(medId);
      }
      return next;
    });
  };

  // Distinct categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const m of initialMedicines) {
      if (m.category) set.add(m.category);
    }
    return Array.from(set).sort();
  }, [initialMedicines]);

  // Filtered medicines for overview tab
  const filteredMedicines = useMemo(() => {
    return initialMedicines.filter((m) => {
      // Category filter
      if (categoryFilter !== "ALL" && m.category !== categoryFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== "ALL" && m.inventory.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesGeneric = m.genericName.toLowerCase().includes(q);
        const matchesBarcode = m.barcode?.toLowerCase().includes(q);
        const matchesBatch = m.batches.some((b) =>
          b.batchNumber.toLowerCase().includes(q)
        );
        return matchesName || matchesGeneric || matchesBarcode || matchesBatch;
      }
      return true;
    });
  }, [initialMedicines, categoryFilter, statusFilter, searchQuery]);

  // Filtered batches for batches tab
  const filteredBatches = useMemo(() => {
    return initialBatches.filter((b) => {
      if (categoryFilter !== "ALL" && b.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.batchNumber.toLowerCase().includes(q) ||
          b.medicineName.toLowerCase().includes(q) ||
          b.genericName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [initialBatches, categoryFilter, searchQuery]);

  // Low stock medicines
  const lowStockMedicines = useMemo(() => {
    return initialMedicines.filter(
      (m) =>
        m.inventory.status === "LOW_STOCK" ||
        m.inventory.status === "OUT_OF_STOCK"
    );
  }, [initialMedicines]);

  // Expired & near expiry batches
  const expiryBatches = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const ninetyDays = new Date(today);
    ninetyDays.setDate(ninetyDays.getDate() + 90);

    return initialBatches
      .filter((b) => {
        if (!b.expiryDate) return false;
        const exp = new Date(b.expiryDate);
        return exp <= ninetyDays && b.stockQuantity > 0;
      })
      .sort(
        (a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );
  }, [initialBatches]);

  // Export inventory to CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        "Medicine Name",
        "Generic Name",
        "Category",
        "Packing",
        "Total Stock Units",
        "Min Quantity",
        "Reorder Level",
        "Status",
        "Active Batches Count",
        "Total Cost Value (INR)",
        "Total MRP Value (INR)",
      ];

      const rows = initialMedicines.map((m) => [
        `"${m.name.replace(/"/g, '""')}"`,
        `"${m.genericName.replace(/"/g, '""')}"`,
        `"${(m.category || "").replace(/"/g, '""')}"`,
        `"${(m.packing || "").replace(/"/g, '""')}"`,
        m.inventory.totalStock,
        m.minimumQuantity || 0,
        m.reorderLevel || 0,
        m.inventory.label,
        m.batches.length,
        m.totalCostValuation,
        m.totalMrpValuation,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `inventory_report_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Inventory report downloaded as CSV.");
    } catch (err) {
      toast.error("Failed to generate CSV export.");
    }
  };

  // Copy wholesale reorder list
  const handleCopyReorderList = () => {
    if (lowStockMedicines.length === 0) {
      toast.info("No low stock items to reorder!");
      return;
    }

    const lines = [
      `*PURCHASE REORDER LIST - ${new Date().toLocaleDateString("en-IN")}*`,
      "------------------------------------------",
    ];

    lowStockMedicines.forEach((m, idx) => {
      const deficit = Math.max(
        0,
        (m.reorderLevel || m.minimumQuantity || 10) - m.inventory.unexpiredStock
      );
      const reorderQty = m.reorderQuantity || deficit || 20;
      lines.push(
        `${idx + 1}. ${m.name} (${m.packing}) - Stock: ${m.inventory.unexpiredStock} | Order: ${reorderQty} units`
      );
    });

    lines.push("------------------------------------------");
    lines.push(`Total Items: ${lowStockMedicines.length}`);

    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Reorder list copied to clipboard for supplier WhatsApp/Email!");
  };

  const handleDeleteBatch = async (batch: EnrichedBatch) => {
    if (
      !confirm(
        `Are you sure you want to delete Batch ${batch.batchNumber} for ${batch.medicineName}?`
      )
    ) {
      return;
    }

    try {
      const res = await deleteBatch(batch.id);
      if (res.success) {
        toast.success(`Batch ${batch.batchNumber} deleted.`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete batch.");
      }
    } catch (err) {
      toast.error("An error occurred while deleting batch.");
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-10 w-full max-w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-zinc-200 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
              Warehouse & Stock Control
            </span>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              Live Sync
            </span>
          </div>
          <h1 className="mt-1 font-extrabold text-3xl text-zinc-900 tracking-tight">
            Inventory Management
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Track stock levels, low stock alerts, and batch numbers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs h-9"
          >
            <RefreshCw
              className={`mr-1.5 size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs h-9"
          >
            <Download className="mr-1.5 size-3.5" />
            Export CSV
          </Button>

          {isAdmin && (
            <Button
              size="sm"
              onClick={() => {
                setTargetMedicineForBatch(null);
                setIsAddBatchOpen(true);
              }}
              className="text-xs h-9 font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs"
            >
              <Plus className="mr-1.5 size-3.5" />
              Inward New Batch
            </Button>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Stock */}
        <Card className="border-zinc-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Total Stock Units
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <Boxes className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl text-zinc-900">
              {initialStats.totalStockUnits.toLocaleString()}{" "}
              <span className="text-xs font-medium text-zinc-400">units</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500 truncate">
              {initialStats.totalMedicines} products &bull; {initialStats.totalBatches} batches
            </p>
            <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-600">
              <span>Cost: <strong className="text-zinc-800">₹{initialStats.totalCostValuation.toLocaleString()}</strong></span>
              <span>MRP: <strong className="text-zinc-800">₹{initialStats.totalMrpValuation.toLocaleString()}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Low Stock Alerts */}
        <Card
          onClick={() => setActiveTab("low_stock")}
          className={`border-zinc-200 shadow-xs cursor-pointer transition-all hover:border-amber-400 ${
            initialStats.lowStockCount > 0 ? "bg-amber-50/40" : "bg-white"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Low Stock Alerts
            </CardTitle>
            <div
              className={`flex size-8 items-center justify-center rounded-lg ${
                initialStats.lowStockCount > 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl text-zinc-900 flex items-center gap-2">
              {initialStats.lowStockCount}
              {initialStats.lowStockCount > 0 && (
                <Badge variant="outline" className="text-[10px] border-amber-300 bg-amber-100 text-amber-900 font-bold">
                  Needs Restock
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Medicines at or below reorder level
            </p>
            <div className="mt-2.5 pt-2 border-t border-zinc-100/80 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
              <span>{initialStats.outOfStockCount} completely out of stock</span>
              <span className="flex items-center text-[10px]">
                View list <ChevronRight className="size-3 ml-0.5" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Expiring Soon */}
        <Card
          onClick={() => setActiveTab("expiry")}
          className={`border-zinc-200 shadow-xs cursor-pointer transition-all hover:border-orange-400 ${
            initialStats.expiringSoonCount > 0 ? "bg-orange-50/40" : "bg-white"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Expiring Soon (&le;30d)
            </CardTitle>
            <div
              className={`flex size-8 items-center justify-center rounded-lg ${
                initialStats.expiringSoonCount > 0
                  ? "bg-orange-100 text-orange-800"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl text-zinc-900 flex items-center gap-2">
              {initialStats.expiringSoonCount}
              {initialStats.expiringSoonCount > 0 && (
                <Badge variant="outline" className="text-[10px] border-orange-300 bg-orange-100 text-orange-900 font-bold">
                  Attention
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Batches expiring in the next 30 days
            </p>
            <div className="mt-2.5 pt-2 border-t border-zinc-100/80 flex items-center justify-between text-[11px] text-orange-800 font-semibold">
              <span>Prioritize for FEFO sales</span>
              <span className="flex items-center text-[10px]">
                Inspect <ChevronRight className="size-3 ml-0.5" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Critical Expired Batches */}
        <Card
          onClick={() => setActiveTab("expiry")}
          className={`border-zinc-200 shadow-xs cursor-pointer transition-all hover:border-red-400 ${
            initialStats.expiredBatchesCount > 0
              ? "bg-red-50/50 border-red-300"
              : "bg-white"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Expired Stock
            </CardTitle>
            <div
              className={`flex size-8 items-center justify-center rounded-lg ${
                initialStats.expiredBatchesCount > 0
                  ? "bg-red-100 text-red-700"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              <AlertCircle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl text-zinc-900 flex items-center gap-2">
              <span className={initialStats.expiredBatchesCount > 0 ? "text-red-700" : ""}>
                {initialStats.expiredBatchesCount}
              </span>
              {initialStats.expiredBatchesCount > 0 && (
                <Badge variant="destructive" className="text-[10px] font-bold">
                  Quarantine
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Batches past expiry with active stock
            </p>
            <div className="mt-2.5 pt-2 border-t border-zinc-100/80 flex items-center justify-between text-[11px] text-red-700 font-semibold">
              <span>{initialStats.expiredBatchesCount > 0 ? "Action required" : "Clean inventory"}</span>
              <span className="flex items-center text-[10px]">
                Write off <ChevronRight className="size-3 ml-0.5" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
            activeTab === "overview"
              ? "bg-zinc-900 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
          }`}
        >
          <Layers className="size-3.5" />
          Stock Overview ({initialMedicines.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("batches")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
            activeTab === "batches"
              ? "bg-zinc-900 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
          }`}
        >
          <Package className="size-3.5" />
          Batch Numbers ({initialBatches.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("low_stock")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
            activeTab === "low_stock"
              ? "bg-zinc-900 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
          }`}
        >
          <AlertTriangle className="size-3.5 text-amber-500" />
          Low Stock Alerts
          {initialStats.lowStockCount > 0 && (
            <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
              {initialStats.lowStockCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("expiry")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
            activeTab === "expiry"
              ? "bg-zinc-900 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
          }`}
        >
          <Clock className="size-3.5 text-orange-500" />
          Expiry Watchlist
          {initialStats.expiredBatchesCount > 0 && (
            <span className="rounded-full bg-red-600 text-white px-1.5 py-0.2 text-[10px] font-bold">
              {initialStats.expiredBatchesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("movements")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
            activeTab === "movements"
              ? "bg-zinc-900 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
          }`}
        >
          <Warehouse className="size-3.5" />
          Movement Logs ({initialMovements.length})
        </button>
      </div>

      {/* Global Filter Bar */}
      {(activeTab === "overview" || activeTab === "batches") && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
            <Input
              type="text"
              placeholder={
                activeTab === "overview"
                  ? "Search by medicine name, generic name, batch number, barcode..."
                  : "Search batch number, medicine name, or generic..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 border-zinc-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] text-xs h-9 border-zinc-200 font-medium">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter (for overview) */}
            {activeTab === "overview" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] text-xs h-9 border-zinc-200 font-medium">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="IN_STOCK">In Stock</SelectItem>
                  <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                  <SelectItem value="EXPIRING_SOON">Expiring Soon</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            )}

            {(searchQuery ||
              categoryFilter !== "ALL" ||
              statusFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="text-xs h-9 text-zinc-500 hover:text-zinc-900"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: STOCK OVERVIEW (MEDICINES LEVEL)
          ========================================================================= */}
      {activeTab === "overview" && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/80">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700">
                    Medicine Details
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700">
                    Category & Packing
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-right">
                    Available Stock
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-center">
                    Reorder Threshold
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-right">
                    Valuation (Cost / MRP)
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-zinc-500 text-sm"
                    >
                      <Package className="mx-auto size-8 text-zinc-300 mb-2" />
                      No medicines match the selected filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMedicines.map((med) => {
                    const isExpanded = expandedMedIds.has(med.id);
                    const inv = med.inventory;
                    const minStock = med.reorderLevel ?? med.minimumQuantity ?? 0;

                    return (
                      <>
                        <TableRow
                          key={med.id}
                          className="hover:bg-zinc-50/60 transition-colors"
                        >
                          <TableCell className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggleExpand(med.id)}
                              className="size-6 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-500"
                            >
                              {isExpanded ? (
                                <ChevronDown className="size-4 text-zinc-800" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </button>
                          </TableCell>

                          <TableCell>
                            <div className="font-bold text-zinc-900 text-xs leading-tight">
                              {med.name}
                            </div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                              {med.genericName}
                              {med.brand && (
                                <span className="text-zinc-400">
                                  {" "}
                                  &bull; {med.brand}
                                </span>
                              )}
                            </div>
                            {med.barcode && (
                              <div className="text-[10px] font-mono text-zinc-400">
                                Barcode: {med.barcode}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-xs">
                            <div className="font-medium text-zinc-800">
                              {med.category || "General"}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {med.packing || "1's"}{" "}
                              {med.conversionFactor > 1 && (
                                <span className="text-zinc-400">
                                  (1 pack = {med.conversionFactor} units)
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="font-extrabold text-sm text-zinc-900">
                              {inv.unexpiredStock}{" "}
                              <span className="text-xs font-normal text-zinc-500">
                                units
                              </span>
                            </div>
                            {med.conversionFactor > 1 && (
                              <div className="text-[10px] text-zinc-400">
                                ~
                                {(
                                  inv.unexpiredStock / med.conversionFactor
                                ).toFixed(1)}{" "}
                                packs
                              </div>
                            )}
                            {inv.expiredStock > 0 && (
                              <div className="text-[10px] font-bold text-red-600">
                                +{inv.expiredStock} expired
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="text-xs font-medium text-zinc-700">
                              {minStock > 0 ? `${minStock} units` : "Not set"}
                            </div>
                            {med.reorderQuantity && (
                              <div className="text-[10px] text-zinc-400">
                                Reorder: {med.reorderQuantity}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              variant={inv.badgeVariant}
                              className={inv.badgeClassName}
                            >
                              {inv.label}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="text-xs font-bold text-zinc-800">
                              ₹{med.totalCostValuation.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              MRP: ₹{med.totalMrpValuation.toLocaleString()}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpand(med.id)}
                                className="h-7 px-2 text-[11px] font-medium text-zinc-600 hover:text-zinc-900"
                              >
                                {med.batches.length} Batches
                              </Button>

                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setTargetMedicineForBatch(med.id);
                                    setIsAddBatchOpen(true);
                                  }}
                                  className="h-7 px-2 text-[11px] font-semibold text-zinc-700"
                                >
                                  <Plus className="size-3 mr-1" />
                                  Add Batch
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Inline Nested Batches Drawer */}
                        {isExpanded && (
                          <TableRow className="bg-zinc-50/70 border-y border-zinc-200">
                            <TableCell colSpan={8} className="p-4 pl-12">
                              <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-xs">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                                    <Package className="size-3.5 text-zinc-500" />
                                    Active Batches for {med.name} (FEFO Order)
                                  </span>
                                  {isAdmin && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setTargetMedicineForBatch(med.id);
                                        setIsAddBatchOpen(true);
                                      }}
                                      className="h-6 text-[10px] font-semibold"
                                    >
                                      <Plus className="size-3 mr-1" />
                                      New Batch
                                    </Button>
                                  )}
                                </div>

                                {med.batches.length === 0 ? (
                                  <div className="py-4 text-center text-xs text-zinc-500">
                                    No batches recorded for this medicine yet.
                                  </div>
                                ) : (
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b border-zinc-100 text-zinc-400 text-[10px] uppercase font-bold text-left">
                                        <th className="py-1.5">Batch #</th>
                                        <th className="py-1.5">Mfg Date</th>
                                        <th className="py-1.5">Expiry Date</th>
                                        <th className="py-1.5 text-right">
                                          Stock Qty
                                        </th>
                                        <th className="py-1.5 text-right">
                                          Purchase Rate
                                        </th>
                                        <th className="py-1.5 text-right">
                                          MRP
                                        </th>
                                        <th className="py-1.5 text-right">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                      {med.batches.map((b) => {
                                        const expDate = new Date(b.expiryDate);
                                        const now = new Date();
                                        const daysRemaining = Math.ceil(
                                          (expDate.getTime() - now.getTime()) /
                                            (1000 * 60 * 60 * 24)
                                        );
                                        const countdown =
                                          formatExpiryCountdown(daysRemaining);

                                        return (
                                          <tr
                                            key={b.id}
                                            className="hover:bg-zinc-50"
                                          >
                                            <td className="py-2 font-mono font-bold text-zinc-900">
                                              {b.batchNumber}
                                            </td>
                                            <td className="py-2 text-zinc-500">
                                              {b.manufacturingDate
                                                ? new Date(
                                                    b.manufacturingDate
                                                  ).toLocaleDateString(
                                                    "en-IN"
                                                  )
                                                : "—"}
                                            </td>
                                            <td className="py-2">
                                              <span
                                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${countdown.className}`}
                                              >
                                                {expDate.toLocaleDateString(
                                                  "en-IN"
                                                )}{" "}
                                                ({countdown.text})
                                              </span>
                                            </td>
                                            <td className="py-2 text-right font-extrabold text-zinc-900">
                                              {b.stockQuantity} units
                                            </td>
                                            <td className="py-2 text-right text-zinc-600">
                                              ₹{b.purchaseRate ?? "—"}
                                            </td>
                                            <td className="py-2 text-right font-semibold text-zinc-800">
                                              ₹{b.mrp}
                                            </td>
                                            <td className="py-2 text-right">
                                              <div className="flex items-center justify-end gap-1">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    setAdjustingBatch({
                                                      id: b.id,
                                                      batchNumber:
                                                        b.batchNumber,
                                                      medicineName: med.name,
                                                      stockQuantity:
                                                        b.stockQuantity,
                                                      packing: med.packing,
                                                    })
                                                  }
                                                  className="h-6 px-2 text-[10px] font-semibold"
                                                >
                                                  Adjust
                                                </Button>

                                                {isAdmin && (
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                      setEditingBatch({
                                                        id: b.id,
                                                        batchNumber:
                                                          b.batchNumber,
                                                        medicineName: med.name,
                                                        expiryDate:
                                                          b.expiryDate,
                                                        manufacturingDate:
                                                          b.manufacturingDate,
                                                        purchaseRate:
                                                          b.purchaseRate,
                                                        mrp: b.mrp,
                                                        stockQuantity:
                                                          b.stockQuantity,
                                                      })
                                                    }
                                                    className="size-6 p-0 text-zinc-500 hover:text-zinc-900"
                                                  >
                                                    <Edit className="size-3" />
                                                  </Button>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BATCH NUMBERS (GRANULAR BATCHES TRACKING)
          ========================================================================= */}
      {activeTab === "batches" && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/80">
                <TableRow>
                  <TableHead className="text-xs font-bold text-zinc-700">
                    Batch Number
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700">
                    Medicine / Product
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700">
                    Mfg Date
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700">
                    Expiry Date & Status
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-right">
                    Stock Quantity
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-right">
                    Purchase Rate
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-right">
                    MRP
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-zinc-500 text-sm"
                    >
                      <Package className="mx-auto size-8 text-zinc-300 mb-2" />
                      No batches found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBatches.map((b) => {
                    const expDate = new Date(b.expiryDate);
                    const now = new Date();
                    const daysRemaining = Math.ceil(
                      (expDate.getTime() - now.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const countdown = formatExpiryCountdown(daysRemaining);

                    return (
                      <TableRow key={b.id} className="hover:bg-zinc-50/60">
                        <TableCell className="font-mono font-bold text-zinc-900 text-xs">
                          {b.batchNumber}
                        </TableCell>

                        <TableCell>
                          <div className="font-bold text-xs text-zinc-900 leading-tight">
                            {b.medicineName}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {b.genericName} &bull; {b.packing}
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-zinc-500">
                          {b.manufacturingDate
                            ? new Date(b.manufacturingDate).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${countdown.className}`}
                          >
                            {expDate.toLocaleDateString("en-IN")} ({countdown.text})
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <span
                            className={`font-extrabold text-sm ${
                              b.stockQuantity === 0
                                ? "text-zinc-400"
                                : "text-zinc-900"
                            }`}
                          >
                            {b.stockQuantity}
                          </span>{" "}
                          <span className="text-xs font-normal text-zinc-500">
                            units
                          </span>
                        </TableCell>

                        <TableCell className="text-right text-xs text-zinc-600">
                          ₹{b.purchaseRate ?? "—"}
                        </TableCell>

                        <TableCell className="text-right text-xs font-bold text-zinc-800">
                          ₹{b.mrp}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setAdjustingBatch({
                                  id: b.id,
                                  batchNumber: b.batchNumber,
                                  medicineName: b.medicineName,
                                  stockQuantity: b.stockQuantity,
                                  packing: b.packing,
                                })
                              }
                              className="h-7 px-2.5 text-xs font-semibold"
                            >
                              Adjust
                            </Button>

                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setEditingBatch({
                                    id: b.id,
                                    batchNumber: b.batchNumber,
                                    medicineName: b.medicineName,
                                    expiryDate: b.expiryDate,
                                    manufacturingDate: b.manufacturingDate,
                                    purchaseRate: b.purchaseRate,
                                    mrp: b.mrp,
                                    stockQuantity: b.stockQuantity,
                                  })
                                }
                                className="size-7 p-0 text-zinc-500 hover:text-zinc-900"
                              >
                                <Edit className="size-3.5" />
                              </Button>
                            )}

                            {isAdmin && b.stockQuantity === 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBatch(b)}
                                className="size-7 p-0 text-zinc-400 hover:text-red-600"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: LOW STOCK ALERTS (RESTOCK PLANNER)
          ========================================================================= */}
      {activeTab === "low_stock" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/60 border border-amber-200 rounded-xl p-4">
            <div>
              <h3 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-amber-600" />
                Procurement & Restock Planner
              </h3>
              <p className="text-xs text-amber-800/80 mt-0.5">
                {lowStockMedicines.length} medicines have stock at or below their
                configured minimum/reorder threshold.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleCopyReorderList}
              className="text-xs font-semibold bg-amber-800 hover:bg-amber-900 text-white shadow-xs"
            >
              <Copy className="size-3.5 mr-1.5" />
              Copy Wholesale Order List
            </Button>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50/80">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-zinc-700">
                      Medicine
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700">
                      Category & Packing
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700 text-right">
                      Current Unexpired Stock
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700 text-center">
                      Threshold / Minimum
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700 text-center">
                      Shortage / Deficit
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700 text-center">
                      Suggested Reorder
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockMedicines.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-12 text-center text-zinc-500 text-sm"
                      >
                        <PackageCheck className="mx-auto size-8 text-emerald-500 mb-2" />
                        All medicines are well-stocked above reorder thresholds!
                      </TableCell>
                    </TableRow>
                  ) : (
                    lowStockMedicines.map((m) => {
                      const min = m.reorderLevel ?? m.minimumQuantity ?? 10;
                      const current = m.inventory.unexpiredStock;
                      const deficit = Math.max(0, min - current);
                      const suggested = m.reorderQuantity || Math.max(deficit, 20);

                      return (
                        <TableRow key={m.id} className="hover:bg-zinc-50/60">
                          <TableCell>
                            <div className="font-bold text-xs text-zinc-900">
                              {m.name}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {m.genericName}
                            </div>
                          </TableCell>

                          <TableCell className="text-xs">
                            <span className="text-zinc-700 font-medium">
                              {m.category || "General"}
                            </span>
                            <span className="text-zinc-400 block text-[11px]">
                              {m.packing}
                            </span>
                          </TableCell>

                          <TableCell className="text-right">
                            <span
                              className={`font-extrabold text-sm ${
                                current === 0
                                  ? "text-red-600"
                                  : "text-amber-700"
                              }`}
                            >
                              {current} units
                            </span>
                          </TableCell>

                          <TableCell className="text-center text-xs font-semibold text-zinc-700">
                            {min} units
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className="border-red-300 bg-red-50 text-red-700 font-bold text-[11px]"
                            >
                              -{deficit} units
                            </Badge>
                          </TableCell>

                          <TableCell className="text-center">
                            <span className="font-bold text-xs text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md">
                              {suggested} units
                            </span>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => {
                                setTargetMedicineForBatch(m.id);
                                setIsAddBatchOpen(true);
                              }}
                              className="h-7 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white"
                            >
                              <Plus className="size-3 mr-1" />
                              Restock Batch
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: EXPIRY WATCHLIST
          ========================================================================= */}
      {activeTab === "expiry" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-orange-50/60 border border-orange-200 rounded-xl p-4">
            <div>
              <h3 className="font-bold text-orange-950 text-sm flex items-center gap-1.5">
                <Clock className="size-4 text-orange-600" />
                Near Expiry & Expired Batches Watchlist
              </h3>
              <p className="text-xs text-orange-900/80 mt-0.5">
                Batches expired or expiring in the next 90 days with remaining
                stock. Follow First Expiry, First Out (FEFO) dispensing or
                quarantine/write-off expired stock.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50/80">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-zinc-700">
                      Batch #
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700">
                      Medicine
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700">
                      Expiry Date
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700 text-center">
                      Remaining Days
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700 text-right">
                      Stock at Risk
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700 text-right">
                      Value at Risk (Cost)
                    </TableHead>
                    <TableHead className="text-xs font-bold text-zinc-700 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiryBatches.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-12 text-center text-zinc-500 text-sm"
                      >
                        <PackageCheck className="mx-auto size-8 text-emerald-500 mb-2" />
                        Zero batches expiring within the next 90 days. Excellent
                        inventory shelf-life!
                      </TableCell>
                    </TableRow>
                  ) : (
                    expiryBatches.map((b) => {
                      const expDate = new Date(b.expiryDate);
                      const now = new Date();
                      const daysRemaining = Math.ceil(
                        (expDate.getTime() - now.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const countdown = formatExpiryCountdown(daysRemaining);
                      const atRiskValue =
                        Math.round(
                          b.stockQuantity * (b.purchaseRate || b.mrp) * 100
                        ) / 100;

                      return (
                        <TableRow key={b.id} className="hover:bg-zinc-50/60">
                          <TableCell className="font-mono font-bold text-xs text-zinc-900">
                            {b.batchNumber}
                          </TableCell>

                          <TableCell>
                            <div className="font-bold text-xs text-zinc-900">
                              {b.medicineName}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {b.genericName} &bull; {b.packing}
                            </div>
                          </TableCell>

                          <TableCell className="text-xs font-medium text-zinc-700">
                            {expDate.toLocaleDateString("en-IN")}
                          </TableCell>

                          <TableCell className="text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${countdown.className}`}
                            >
                              {countdown.text}
                            </span>
                          </TableCell>

                          <TableCell className="text-right font-extrabold text-xs text-zinc-900">
                            {b.stockQuantity} units
                          </TableCell>

                          <TableCell className="text-right text-xs font-bold text-zinc-800">
                            ₹{atRiskValue.toLocaleString()}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setAdjustingBatch({
                                    id: b.id,
                                    batchNumber: b.batchNumber,
                                    medicineName: b.medicineName,
                                    stockQuantity: b.stockQuantity,
                                    packing: b.packing,
                                  })
                                }
                                className="h-7 px-2.5 text-xs font-semibold"
                              >
                                {daysRemaining <= 0
                                  ? "Write Off (Dispose)"
                                  : "Adjust Stock"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: WAREHOUSE MOVEMENT AUDIT LOGS
          ========================================================================= */}
      {activeTab === "movements" && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">
                Warehouse Movement Ledger
              </h3>
              <p className="text-xs text-zinc-500">
                Complete historical record of inward purchases, sales
                deductions, damages, and audit adjustments.
              </p>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              Showing last {initialMovements.length} events
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/80">
                <TableRow>
                  <TableHead className="text-xs font-bold text-zinc-700">
                    Timestamp
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700">
                    Medicine / Batch
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-center">
                    Movement Type
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-right">
                    Quantity Change
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-center">
                    Stock Transition
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700">
                    Reason / Reference
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-700 text-right">
                    Performed By
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialMovements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-zinc-500 text-sm"
                    >
                      <Warehouse className="mx-auto size-8 text-zinc-300 mb-2" />
                      No stock movements recorded yet. Movements will be
                      automatically recorded during sales, inward batch entries,
                      and stock adjustments.
                    </TableCell>
                  </TableRow>
                ) : (
                  initialMovements.map((m) => {
                    const isPositive = m.quantity > 0;
                    let typeBadgeClass =
                      "border-zinc-200 bg-zinc-100 text-zinc-800";
                    if (m.type === "PURCHASE") {
                      typeBadgeClass =
                        "border-emerald-200 bg-emerald-50 text-emerald-800 font-bold";
                    } else if (m.type === "SALE") {
                      typeBadgeClass =
                        "border-blue-200 bg-blue-50 text-blue-800 font-semibold";
                    } else if (m.type === "DAMAGE" || m.type === "EXPIRY") {
                      typeBadgeClass =
                        "border-red-200 bg-red-50 text-red-800 font-bold";
                    } else if (m.type === "ADJUSTMENT") {
                      typeBadgeClass =
                        "border-purple-200 bg-purple-50 text-purple-800 font-bold";
                    } else if (m.type === "RETURN") {
                      typeBadgeClass =
                        "border-amber-200 bg-amber-50 text-amber-800 font-bold";
                    }

                    return (
                      <TableRow key={m.id} className="hover:bg-zinc-50/60">
                        <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          <span className="text-[10px] text-zinc-400">
                            {new Date(m.createdAt).toLocaleTimeString(
                              "en-IN",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="font-bold text-xs text-zinc-900 leading-tight">
                            {m.medicineName}
                          </div>
                          <div className="font-mono text-[10px] text-zinc-500">
                            Batch: {m.batchNumber}
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${typeBadgeClass}`}
                          >
                            {m.type}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <span
                            className={`font-extrabold text-xs inline-flex items-center gap-0.5 ${
                              isPositive ? "text-emerald-700" : "text-red-700"
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="size-3.5" />
                            ) : (
                              <ArrowDownRight className="size-3.5" />
                            )}
                            {isPositive ? `+${m.quantity}` : m.quantity} units
                          </span>
                        </TableCell>

                        <TableCell className="text-center font-mono text-xs text-zinc-600">
                          {m.previousStock} &rarr;{" "}
                          <strong className="text-zinc-900">{m.newStock}</strong>
                        </TableCell>

                        <TableCell className="text-xs text-zinc-600 max-w-[200px] truncate">
                          {m.referenceId || m.referenceType || "—"}
                        </TableCell>

                        <TableCell className="text-right text-xs font-medium text-zinc-700">
                          {m.performedByName}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS / DIALOGS
          ========================================================================= */}

      {/* Adjust Stock Dialog */}
      <AdjustStockDialog
        isOpen={!!adjustingBatch}
        onClose={() => setAdjustingBatch(null)}
        batch={adjustingBatch}
        onAdjusted={() => {
          router.refresh();
        }}
      />

      {/* Edit Batch Dialog */}
      <EditBatchDialog
        isOpen={!!editingBatch}
        onClose={() => setEditingBatch(null)}
        batch={editingBatch}
        onUpdated={() => {
          router.refresh();
        }}
      />

      {/* Add New Batch Modal */}
      <AddBatchModal
        isOpen={isAddBatchOpen}
        onClose={() => {
          setIsAddBatchOpen(false);
          setTargetMedicineForBatch(null);
        }}
        medicines={initialMedicines}
        preselectedMedicineId={targetMedicineForBatch}
        onBatchAdded={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
