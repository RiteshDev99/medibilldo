"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Plus, ShieldCheck, ShieldAlert, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateStoreStatus } from "@/server/store";
import { toast } from "sonner";
import type { Store } from "@/db/schema";

interface StoresClientProps {
  initialStores: Store[];
}

export function StoresClient({ initialStores }: StoresClientProps) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");
  const [activeDialogStore, setActiveDialogStore] = useState<Store | null>(null);
  const [deactiveDialogStore, setDeactiveDialogStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/super-admin/stores?search=${encodeURIComponent(searchVal)}`);
  };

  const handleClearSearch = () => {
    setSearchVal("");
    router.push("/super-admin/stores");
  };

  const handleToggleStatus = async (storeId: string, currentStatus: string) => {
    setIsLoading(true);
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await updateStoreStatus(storeId, newStatus);
      if (res.success) {
        toast.success(`Store ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully.`);
        setActiveDialogStore(null);
        setDeactiveDialogStore(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update store status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen space-y-8 bg-zinc-50/50 p-6 text-zinc-950 md:p-10">
      {/* Title & Headers */}
      <div className="flex flex-col gap-4 border-zinc-200 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
            Platform Master
          </span>
          <h1 className="mt-1 font-extrabold text-3xl text-zinc-900 tracking-tight">
            Stores Directory
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            View, search, and manage all active and inactive pharmacy locations.
          </p>
        </div>
        <Link href="/super-admin/stores/new">
          <Button className="flex items-center gap-1.5 bg-black font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800">
            <Plus className="size-4" />
            Create Store
          </Button>
        </Link>
      </div>

      {/* Filters Area */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            className="border-zinc-200 bg-white pl-9 focus:border-zinc-900"
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search stores by name, legal name, city, phone, or GST..."
            value={searchVal}
          />
        </div>
        <Button type="submit" className="bg-zinc-900 text-white font-medium hover:bg-zinc-850">
          Search
        </Button>
        {searchVal && (
          <Button type="button" variant="outline" onClick={handleClearSearch} className="border-zinc-200 bg-white">
            Clear
          </Button>
        )}
      </form>

      {/* Stores List Card */}
      <Card className="border-zinc-200 bg-white shadow-xs">
        <CardContent className="p-0">
          {initialStores.length === 0 ? (
            <div className="p-12 text-center text-zinc-450">
              <Building2 className="mx-auto size-8 text-zinc-300" />
              <p className="mt-4 text-sm font-semibold text-zinc-800">No stores found.</p>
              <p className="mt-1 text-xs text-zinc-550">Create your first store to get started.</p>
              <Link href="/super-admin/stores/new" className="mt-4 inline-block">
                <Button className="bg-black text-white font-semibold">
                  Create Store
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-zinc-50 border-zinc-150 border-b">
                <TableRow>
                  <TableHead className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Store details</TableHead>
                  <TableHead className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Contact Info</TableHead>
                  <TableHead className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Compliance (GSTIN / Drug / Pharmacy)</TableHead>
                  <TableHead className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialStores.map((item) => (
                  <TableRow key={item.id} className="border-zinc-150 border-b hover:bg-zinc-50/20">
                    <TableCell>
                      <p className="font-bold text-zinc-950 text-sm">{item.storeName}</p>
                      {item.legalName && (
                        <p className="text-xs text-zinc-500">Legal: {item.legalName}</p>
                      )}
                      <p className="text-[10px] text-zinc-400 mt-0.5">ID: {item.id}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-zinc-700">{item.phone}</p>
                      <p className="text-xs text-zinc-450 mt-0.5">{item.city}, {item.state}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs text-zinc-650">
                        {item.gstNumber ? <p>GST: <span className="font-bold">{item.gstNumber}</span></p> : <p className="text-zinc-400 text-[11px]">GST: Not Provided</p>}
                        {item.drugLicenseNumber ? <p>Drug Lic: <span className="font-bold">{item.drugLicenseNumber}</span></p> : <p className="text-zinc-400 text-[11px]">Drug Lic: Not Provided</p>}
                        {item.pharmacyLicenseNumber ? <p>Pharmacy Lic: <span className="font-bold">{item.pharmacyLicenseNumber}</span></p> : <p className="text-zinc-400 text-[11px]">Pharmacy Lic: Not Provided</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase ${
                        item.status === "ACTIVE" 
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}>
                        <span className={`size-1.5 rounded-full ${item.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`} />
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link href={`/super-admin/stores/${item.id}`}>
                          <Button size="icon" variant="outline" className="border-zinc-200 bg-white hover:bg-zinc-50" title="View details">
                            <Eye className="size-4 text-zinc-650" />
                          </Button>
                        </Link>
                        {item.status === "ACTIVE" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-semibold text-xs"
                            onClick={() => setDeactiveDialogStore(item)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs"
                            onClick={() => setActiveDialogStore(item)}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Activation Confirmation Dialog */}
      <Dialog open={activeDialogStore !== null} onOpenChange={(open) => !open && setActiveDialogStore(null)}>
        <DialogContent className="bg-white border-zinc-200">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg text-zinc-950">Activate Store?</DialogTitle>
            <DialogDescription className="text-zinc-550 text-sm">
              This will restore access to the store&apos;s <strong>ADMIN</strong> and <strong>STAFF</strong> users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-zinc-200 bg-white"
              onClick={() => setActiveDialogStore(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={() => activeDialogStore && handleToggleStatus(activeDialogStore.id, "INACTIVE")}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Activate Store"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivation Confirmation Dialog */}
      <Dialog open={deactiveDialogStore !== null} onOpenChange={(open) => !open && setDeactiveDialogStore(null)}>
        <DialogContent className="bg-white border-zinc-200">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg text-zinc-950">Deactivate Store?</DialogTitle>
            <DialogDescription className="text-zinc-550 text-sm space-y-2">
              <p>
                This will prevent the store&apos;s <strong>ADMIN</strong> and <strong>STAFF</strong> users from accessing the MediBilldo store application.
              </p>
              <p className="text-xs text-zinc-450 italic">
                The store&apos;s data will not be deleted.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-zinc-200 bg-white"
              onClick={() => setDeactiveDialogStore(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-650 hover:bg-red-750 text-white font-bold"
              onClick={() => deactiveDialogStore && handleToggleStatus(deactiveDialogStore.id, "ACTIVE")}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Deactivate Store"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
