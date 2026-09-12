"use client";

import {
  Edit2,
  Loader2,
  Phone,
  Search,
  Stethoscope,
  User,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { formatINR } from "@/lib/billing-calc";
import { createCustomer, searchCustomers } from "@/server/billing";

export interface SelectedCustomer {
  id: string | null;
  name: string;
  phone: string | null;
  doctorName: string | null;
  creditBalance: number;
}

interface CustomerPanelProps {
  customer: SelectedCustomer;
  onCustomerChange: (customer: SelectedCustomer) => void;
  isModalOpen?: boolean;
  onToggleModal?: (open: boolean) => void;
}

interface CustomerSearchResult {
  id: string;
  name: string;
  phone?: string | null;
  doctorName?: string | null;
  creditBalance?: number;
}

export function CustomerPanel({
  customer,
  onCustomerChange,
  isModalOpen: externalModalOpen,
  onToggleModal,
}: CustomerPanelProps) {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen =
    externalModalOpen !== undefined ? externalModalOpen : internalModalOpen;
  const setIsModalOpen = onToggleModal || setInternalModalOpen;

  // Active tab inside modal: "search" | "new"
  const [activeTab, setActiveTab] = useState<"search" | "new">("search");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // New Customer state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDoctor, setNewDoctor] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Debounced customer search
  useEffect(() => {
    if (!isModalOpen || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchCustomers(searchQuery);
        if (res.success && res.customers) {
          setSearchResults(res.customers as CustomerSearchResult[]);
        }
      } catch (err) {
        console.error("Customer search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, isModalOpen]);

  const handleSelectCustomer = (cust: CustomerSearchResult) => {
    onCustomerChange({
      id: cust.id,
      name: cust.name,
      phone: cust.phone || null,
      doctorName: cust.doctorName || customer.doctorName || null,
      creditBalance: cust.creditBalance || 0,
    });
    setIsModalOpen(false);
    setSearchQuery("");
  };

  const handleResetToWalkIn = () => {
    onCustomerChange({
      id: null,
      name: "Walk-in Customer",
      phone: null,
      doctorName: null,
      creditBalance: 0,
    });
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    setIsCreating(true);
    try {
      const res = await createCustomer({
        name: newName.trim(),
        phone: newPhone.trim() || null,
        doctorName: newDoctor.trim() || null,
        address: newAddress.trim() || null,
      });

      if (res.success && res.customer) {
        toast.success(`Customer "${res.customer.name}" created!`);
        handleSelectCustomer(res.customer as CustomerSearchResult);
        setNewName("");
        setNewPhone("");
        setNewDoctor("");
        setNewAddress("");
      } else {
        toast.error(res.error || "Failed to create customer");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const isWalkIn =
    !customer.id &&
    (!customer.name || customer.name === "Walk-in Customer") &&
    !customer.phone;

  return (
    <>
      {/* Sleek Compact Customer Bar (Saves vertical space) */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2.5 shadow-2xs transition-all">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
              isWalkIn
                ? "bg-zinc-100 text-zinc-600"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isWalkIn ? (
              <User className="size-4" />
            ) : (
              <UserCheck className="size-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-extrabold text-xs text-zinc-900">
                {customer.name}
              </span>
              {!isWalkIn && customer.id ? (
                <Badge className="bg-emerald-600 px-1 py-0 font-bold text-[9px] text-white">
                  Reg
                </Badge>
              ) : (
                <span className="text-[10px] text-zinc-400">• Cash/UPI</span>
              )}
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
              {customer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="size-2.5" />
                  {customer.phone}
                </span>
              )}
              {customer.doctorName && (
                <span className="flex items-center gap-1 text-zinc-400">
                  <Stethoscope className="size-2.5" />
                  Dr. {customer.doctorName}
                </span>
              )}
              {customer.creditBalance > 0 && (
                <span className="font-bold text-amber-700">
                  Due: {formatINR(customer.creditBalance)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1.5">
          {isWalkIn ? (
            <Button
              className="h-7 cursor-pointer rounded-lg border-zinc-200 font-bold text-[11px] text-zinc-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
              onClick={() => setIsModalOpen(true)}
              size="sm"
              type="button"
              variant="outline"
            >
              <UserPlus className="mr-1 size-3 text-emerald-600" />
              Patient / Dr (F9)
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                className="size-7 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                onClick={() => setIsModalOpen(true)}
                size="icon"
                title="Edit Customer Details"
                type="button"
                variant="ghost"
              >
                <Edit2 className="size-3" />
              </Button>
              <Button
                className="size-7 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600"
                onClick={handleResetToWalkIn}
                size="icon"
                title="Reset to Walk-in"
                type="button"
                variant="ghost"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Customer & Doctor Selection / Registration Dialog */}
      <Dialog onOpenChange={setIsModalOpen} open={isModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-base text-zinc-900">
              Customer & Prescriber Details
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Attach a customer for invoice records, doctor prescription, or
              credit billing.
            </DialogDescription>
          </DialogHeader>

          {/* Tab Selector: Existing vs New */}
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-zinc-200 bg-zinc-100/80 p-1">
            <button
              className={`rounded-lg py-1.5 font-bold text-xs transition-all ${
                activeTab === "search"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
              onClick={() => setActiveTab("search")}
              type="button"
            >
              <Search className="mr-1.5 inline size-3.5" />
              Search Existing
            </button>
            <button
              className={`rounded-lg py-1.5 font-bold text-xs transition-all ${
                activeTab === "new"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
              onClick={() => setActiveTab("new")}
              type="button"
            >
              <UserPlus className="mr-1.5 inline size-3.5" />
              New / Quick Info
            </button>
          </div>

          {activeTab === "search" ? (
            <div className="space-y-3 pt-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-3 left-3 size-4 text-zinc-400" />
                <Input
                  autoFocus
                  className="h-10 pl-9 font-medium text-xs"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type name or phone number..."
                  value={searchQuery}
                />
              </div>

              <div className="max-h-56 min-h-[140px] overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-1">
                {isSearching && (
                  <div className="flex items-center justify-center p-6 text-xs text-zinc-400">
                    <Loader2 className="mr-2 size-4 animate-spin text-emerald-600" />
                    Searching customers...
                  </div>
                )}

                {!isSearching && searchResults.length === 0 && (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    {searchQuery.trim()
                      ? "No customer found with this search."
                      : "Start typing name or mobile number to search."}
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="divide-y divide-zinc-200/60">
                    {searchResults.map((cust) => (
                      <button
                        className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs transition-colors hover:bg-emerald-50"
                        key={cust.id}
                        onClick={() => handleSelectCustomer(cust)}
                        type="button"
                      >
                        <div>
                          <span className="font-bold text-zinc-900">
                            {cust.name}
                          </span>
                          {cust.phone && (
                            <span className="ml-2 font-mono text-zinc-500">
                              {cust.phone}
                            </span>
                          )}
                          {cust.doctorName && (
                            <div className="text-[10px] text-zinc-400">
                              Dr. {cust.doctorName}
                            </div>
                          )}
                        </div>
                        {cust.creditBalance && cust.creditBalance > 0 ? (
                          <span className="font-bold font-mono text-[11px] text-amber-700">
                            Due: {formatINR(cust.creditBalance)}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="flex-row items-center justify-between border-zinc-100 border-t pt-2">
                <Button
                  onClick={handleResetToWalkIn}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Clear to Walk-in
                </Button>
                <Button
                  onClick={() => setIsModalOpen(false)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form className="space-y-3 pt-2" onSubmit={handleCreateCustomer}>
              <div className="space-y-1">
                <Label className="font-semibold text-xs">Customer Name *</Label>
                <Input
                  autoFocus
                  className="h-9 text-xs"
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  required
                  value={newName}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="font-semibold text-xs">Mobile Number</Label>
                  <Input
                    className="h-9 font-mono text-xs"
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    value={newPhone}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="font-semibold text-xs">Doctor Name</Label>
                  <Input
                    className="h-9 text-xs"
                    onChange={(e) => setNewDoctor(e.target.value)}
                    placeholder="e.g. Dr. Verma"
                    value={newDoctor}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="font-semibold text-xs">
                  Address (Optional)
                </Label>
                <Input
                  className="h-9 text-xs"
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Locality / Area"
                  value={newAddress}
                />
              </div>

              <DialogFooter className="border-zinc-100 border-t pt-2">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 font-bold text-white text-xs hover:bg-emerald-700"
                  disabled={isCreating}
                  size="sm"
                  type="submit"
                >
                  {isCreating && (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  )}
                  Save & Select Customer
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
