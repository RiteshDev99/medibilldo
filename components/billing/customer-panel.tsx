"use client";

import { Loader2, Search, Stethoscope, User, UserPlus, X } from "lucide-react";
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
}

export function CustomerPanel({
  customer,
  onCustomerChange,
}: CustomerPanelProps) {
  const [isWalkIn, setIsWalkIn] = useState(!customer.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // New Customer Dialog state
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDoctor, setNewDoctor] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Search customers debounced
  useEffect(() => {
    if (!(searchQuery.trim() && isSearchOpen)) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchCustomers(searchQuery);
        if (res.success && res.customers) {
          setSearchResults(res.customers);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen]);

  const handleSelectCustomer = (cust: any) => {
    onCustomerChange({
      id: cust.id,
      name: cust.name,
      phone: cust.phone || null,
      doctorName: cust.doctorName || customer.doctorName || null,
      creditBalance: cust.creditBalance || 0,
    });
    setIsWalkIn(false);
    setIsSearchOpen(false);
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
    setIsWalkIn(true);
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
        handleSelectCustomer(res.customer);
        setIsNewCustomerOpen(false);
        setNewName("");
        setNewPhone("");
        setNewDoctor("");
        setNewAddress("");
      } else {
        toast.error(res.error || "Failed to create customer");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-zinc-100 border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
            <User className="size-4" />
          </div>
          <span className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider">
            Customer & Doctor Info
          </span>
        </div>

        {/* Walk-in vs Search Toggle */}
        <div className="flex items-center gap-1.5">
          {isWalkIn ? (
            <Button
              className="h-7 font-bold text-[11px] text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => setIsNewCustomerOpen(true)}
              size="sm"
              type="button"
              variant="outline"
            >
              <UserPlus className="mr-1 size-3" /> Add Customer
            </Button>
          ) : (
            <Button
              className="h-7 font-bold text-[11px] text-zinc-600 hover:bg-zinc-50"
              onClick={handleResetToWalkIn}
              size="sm"
              type="button"
              variant="outline"
            >
              <X className="mr-1 size-3" /> Reset to Walk-in
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {/* If Registered Customer Selected */}
        {!isWalkIn && customer.id ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-zinc-900">
                    {customer.name}
                  </span>
                  <span className="rounded bg-emerald-600 px-1.5 py-0.2 font-bold font-mono text-[9px] text-white uppercase">
                    Registered
                  </span>
                </div>
                {customer.phone && (
                  <p className="mt-0.5 font-mono text-xs text-zinc-600">
                    📞 {customer.phone}
                  </p>
                )}
              </div>

              {customer.creditBalance > 0 && (
                <div className="text-right">
                  <span className="block font-bold text-[10px] text-amber-700 uppercase">
                    Due Balance
                  </span>
                  <span className="font-extrabold font-mono text-red-600 text-xs">
                    {formatINR(customer.creditBalance)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Walk-in inputs & Search bar */
          <div className="space-y-2.5">
            <div className="relative">
              <div className="pointer-events-none absolute top-2.5 left-2.5 text-zinc-400">
                <Search className="size-3.5" />
              </div>
              <Input
                className="h-8 rounded-lg pl-8 font-medium text-xs"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Lookup existing customer by name or phone number..."
                value={searchQuery}
              />

              {/* Autocomplete Dropdown */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute top-full z-40 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-xl">
                  {isSearching ? (
                    <div className="flex items-center justify-center p-3 text-xs text-zinc-400">
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-3 text-center text-xs text-zinc-500">
                      No customer found.
                    </div>
                  ) : (
                    searchResults.map((cust) => (
                      <button
                        className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-emerald-50"
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
                              ({cust.phone})
                            </span>
                          )}
                        </div>
                        {cust.creditBalance > 0 && (
                          <span className="font-bold font-mono text-[11px] text-red-600">
                            Due: {formatINR(cust.creditBalance)}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="font-bold text-[10px] text-zinc-500 uppercase">
                  Customer / Patient Name
                </Label>
                <Input
                  className="h-8 font-medium text-xs"
                  onChange={(e) =>
                    onCustomerChange({
                      ...customer,
                      name: e.target.value || "Walk-in Customer",
                    })
                  }
                  placeholder="Walk-in Customer"
                  value={
                    customer.name === "Walk-in Customer" ? "" : customer.name
                  }
                />
              </div>

              <div>
                <Label className="font-bold text-[10px] text-zinc-500 uppercase">
                  Phone (Optional)
                </Label>
                <Input
                  className="h-8 font-mono text-xs"
                  onChange={(e) =>
                    onCustomerChange({
                      ...customer,
                      phone: e.target.value,
                    })
                  }
                  placeholder="10-digit mobile"
                  value={customer.phone || ""}
                />
              </div>
            </div>
          </div>
        )}

        {/* Doctor Name Field */}
        <div>
          <div className="flex items-center gap-1">
            <Stethoscope className="size-3 text-zinc-400" />
            <Label className="font-bold text-[10px] text-zinc-500 uppercase">
              Prescribed By Doctor (Optional)
            </Label>
          </div>
          <Input
            className="mt-1 h-8 font-medium text-xs"
            onChange={(e) =>
              onCustomerChange({
                ...customer,
                doctorName: e.target.value,
              })
            }
            placeholder="e.g. Dr. A. K. Sharma (MBBS)"
            value={customer.doctorName || ""}
          />
        </div>
      </div>

      {/* Inline Create Customer Dialog */}
      <Dialog onOpenChange={setIsNewCustomerOpen} open={isNewCustomerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold text-base">
              Register New Customer
            </DialogTitle>
            <DialogDescription className="text-xs">
              Save customer details for invoice tracking and credit records.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-3 pt-2" onSubmit={handleCreateCustomer}>
            <div className="space-y-1">
              <Label className="font-semibold text-xs">Full Name *</Label>
              <Input
                autoFocus
                className="text-xs"
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                required
                value={newName}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="font-semibold text-xs">Phone Number</Label>
                <Input
                  className="font-mono text-xs"
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="9876543210"
                  value={newPhone}
                />
              </div>

              <div className="space-y-1">
                <Label className="font-semibold text-xs">Doctor Name</Label>
                <Input
                  className="text-xs"
                  onChange={(e) => setNewDoctor(e.target.value)}
                  placeholder="Dr. Sharma"
                  value={newDoctor}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs">Address / Notes</Label>
              <Input
                className="text-xs"
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="City, locality, etc."
                value={newAddress}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                className="text-xs"
                onClick={() => setIsNewCustomerOpen(false)}
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
                Save Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
