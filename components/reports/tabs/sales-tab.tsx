"use client";

import { ChevronLeft, ChevronRight, Eye, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceReportRow } from "@/server/reports";

interface SalesTabProps {
  invoices: InvoiceReportRow[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewInvoice: (invoiceId: string) => void;
}

const PAGE_SIZE = 15;

export function SalesTab({
  invoices,
  searchQuery,
  onSearchChange,
  onViewInvoice,
}: SalesTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const q = searchQuery.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        (inv.customerPhone && inv.customerPhone.includes(q)) ||
        inv.paymentMode.toLowerCase().includes(q) ||
        inv.cashierName.toLowerCase().includes(q)
    );
  }, [invoices, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / PAGE_SIZE)
  );
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  return (
    <div className="space-y-4">
      {/* Search Bar & Summary Count */}
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-zinc-400" />
          <Input
            className="h-9 border-zinc-200 bg-zinc-50/50 pl-9 text-xs"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search invoice #, customer name, phone, cashier..."
            value={searchQuery}
          />
          {searchQuery && (
            <button
              className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-zinc-600"
              onClick={() => onSearchChange("")}
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="text-xs text-zinc-500">
          Showing{" "}
          <strong className="text-zinc-900">{filteredInvoices.length}</strong>{" "}
          of <strong className="text-zinc-900">{invoices.length}</strong>{" "}
          invoices
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-zinc-200 border-b bg-zinc-50/80 font-bold text-[10px] text-zinc-600 uppercase tracking-wider">
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Customer Details</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-right">Tax & Cess</th>
                <th className="px-4 py-3 text-right">Grand Total</th>
                <th className="px-4 py-3 text-center">Mode</th>
                <th className="px-4 py-3">Cashier</th>
                <th className="px-4 py-3 text-center print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td className="py-12 text-center text-zinc-400" colSpan={10}>
                    No invoices found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr
                    className="transition-colors hover:bg-zinc-50/80"
                    key={inv.id}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-bold font-mono text-zinc-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                      {inv.createdAt}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-zinc-900">
                        {inv.customerName}
                      </p>
                      {inv.customerPhone && (
                        <p className="text-[10px] text-zinc-400">
                          {inv.customerPhone}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 font-bold text-zinc-700">
                        {inv.itemsCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-600">
                      {formatCurrency(inv.subtotal)}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-600">
                      {formatCurrency(inv.gstTotal + inv.cessTotal)}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-zinc-950">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span
                        className={`rounded px-2 py-0.5 font-bold text-[9px] uppercase ${
                          inv.paymentMode === "UPI"
                            ? "bg-zinc-900 text-white"
                            : inv.paymentMode === "CASH"
                              ? "border border-zinc-200 bg-zinc-100 text-zinc-800"
                              : inv.paymentMode === "CREDIT"
                                ? "border border-amber-200 bg-amber-100 text-amber-800"
                                : "border border-blue-200 bg-blue-100 text-blue-800"
                        }`}
                      >
                        {inv.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {inv.cashierName}
                    </td>
                    <td className="px-4 py-3 text-center print:hidden">
                      <Button
                        className="h-7 gap-1 px-2 font-semibold text-xs text-zinc-700 hover:text-black"
                        onClick={() => onViewInvoice(inv.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Eye className="size-3.5" />
                        <span>View</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredInvoices.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-zinc-100 border-t bg-zinc-50/50 px-4 py-2.5 text-xs text-zinc-600 print:hidden">
            <div>
              Showing{" "}
              <strong className="text-zinc-900">{startIndex + 1}</strong> to{" "}
              <strong className="text-zinc-900">
                {Math.min(startIndex + PAGE_SIZE, filteredInvoices.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-zinc-900">
                {filteredInvoices.length}
              </strong>{" "}
              entries
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                className="h-7 px-2 text-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                size="sm"
                variant="outline"
              >
                <ChevronLeft className="mr-0.5 size-3.5" />
                Previous
              </Button>
              <span className="px-2 font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                className="h-7 px-2 text-xs"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                size="sm"
                variant="outline"
              >
                Next
                <ChevronRight className="ml-0.5 size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
