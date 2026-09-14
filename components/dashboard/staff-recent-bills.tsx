"use client";

import { Loader2, Printer, ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  type InvoicePrintData,
  InvoiceReceiptModal,
} from "@/components/billing/invoice-receipt-modal";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/db/schema";
import { getInvoiceById } from "@/server/billing";

interface StaffRecentBillsProps {
  bills: Invoice[];
}

function formatRelativeOrTime(date: Date | string | null): string {
  if (!date) {
    return "Recently";
  }
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  }
  if (diffHours < 24 && d.getDate() === now.getDate()) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PaymentBadge({ mode }: { mode: string }) {
  if (mode === "UPI") {
    return (
      <span className="rounded bg-zinc-900 px-2 py-0.5 font-bold text-[10px] text-white uppercase">
        UPI
      </span>
    );
  }
  if (mode === "CASH") {
    return (
      <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-bold text-[10px] text-zinc-800 uppercase">
        Cash
      </span>
    );
  }
  if (mode === "CREDIT") {
    return (
      <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-[10px] text-amber-800 uppercase">
        Credit
      </span>
    );
  }
  return (
    <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-bold text-[10px] text-blue-800 uppercase">
      {mode}
    </span>
  );
}

export function StaffRecentBills({ bills }: StaffRecentBillsProps) {
  const router = useRouter();
  const [selectedReceipt, setSelectedReceipt] =
    useState<InvoicePrintData | null>(null);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);

  const handleOpenReceipt = async (invId: string) => {
    setLoadingInvoiceId(invId);
    try {
      const res = await getInvoiceById(invId);
      if (res.success && res.invoice && res.items) {
        setSelectedReceipt({
          invoice: res.invoice,
          items: res.items,
          store: res.store ?? null,
          cashierName: res.cashier || "Staff",
        });
      } else {
        toast.error(res.error || "Failed to load invoice receipt.");
      }
    } catch {
      toast.error("Error retrieving invoice details.");
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  if (bills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ReceiptText className="size-8 text-zinc-300" />
        <p className="mt-2 font-bold text-sm text-zinc-800">
          No Invoices Processed Yet
        </p>
        <p className="mt-0.5 max-w-sm text-xs text-zinc-500">
          Invoices issued from your billing terminal will appear here in real
          time.
        </p>
        <Button
          className="mt-4 font-bold text-xs"
          onClick={() => router.push("/dashboard/billing")}
        >
          Create First Bill
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-650">
          <thead className="border-zinc-100 border-b bg-zinc-50/50 font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Invoice #</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Doctor</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Mode</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-150">
            {bills.map((bill) => {
              const isLoadingThis = loadingInvoiceId === bill.id;
              return (
                <tr
                  className="transition-colors hover:bg-zinc-50/30"
                  key={bill.id}
                >
                  <td className="px-6 py-4 font-bold text-zinc-950">
                    #{bill.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-900">
                    {bill.customerName || "Walk-in"}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {bill.doctorName ? `Dr. ${bill.doctorName}` : "—"}
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-900">
                    ₹{bill.grandTotal.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <PaymentBadge mode={bill.paymentMode} />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded border px-2 py-0.5 font-bold text-[9px] ${
                        bill.paymentStatus === "PAID"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {formatRelativeOrTime(bill.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      className="cursor-pointer gap-1 border-zinc-200 font-semibold text-[11px] hover:bg-zinc-100"
                      disabled={isLoadingThis}
                      onClick={() => handleOpenReceipt(bill.id)}
                      size="sm"
                      variant="outline"
                    >
                      {isLoadingThis ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Printer className="size-3" />
                      )}
                      <span>Receipt</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedReceipt && (
        <InvoiceReceiptModal
          autoPrint={false}
          data={selectedReceipt}
          isOpen={true}
          onClose={() => setSelectedReceipt(null)}
          onNewBill={() => {
            setSelectedReceipt(null);
            router.push("/dashboard/billing");
          }}
        />
      )}
    </>
  );
}
