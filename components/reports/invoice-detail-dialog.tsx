"use client";

import { Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

interface InvoiceDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  invoiceDetails: any | null;
}

export function InvoiceDetailDialog({
  isOpen,
  onClose,
  isLoading,
  invoiceDetails,
}: InvoiceDetailDialogProps) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between font-black text-lg text-zinc-950">
            <span>
              Invoice {invoiceDetails?.invoice.invoiceNumber || "Details"}
            </span>
            {invoiceDetails?.invoice && (
              <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-bold text-xs text-zinc-800">
                {invoiceDetails.invoice.paymentMode}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Customer: <strong>{invoiceDetails?.invoice.customerName}</strong> (
            {invoiceDetails?.invoice.customerPhone || "Walk-in"}) • Cashier:{" "}
            <strong>{invoiceDetails?.cashier}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            <RefreshCw className="mx-auto mb-2 size-5 animate-spin text-zinc-900" />
            Loading invoice receipt details...
          </div>
        ) : invoiceDetails ? (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            <div className="overflow-hidden rounded-lg border border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead className="border-zinc-200 border-b bg-zinc-50 font-bold text-[10px] text-zinc-600 uppercase">
                  <tr>
                    <th className="px-3 py-2.5">Medicine</th>
                    <th className="px-2 py-2.5">Batch</th>
                    <th className="px-2 py-2.5 text-center">Qty</th>
                    <th className="px-2 py-2.5 text-right">MRP</th>
                    <th className="px-2 py-2.5 text-center">GST</th>
                    <th className="px-3 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {invoiceDetails.items.map((item: any) => (
                    <tr className="hover:bg-zinc-50/50" key={item.id}>
                      <td className="px-3 py-2 font-semibold text-zinc-900">
                        {item.medicineName}
                        {item.hsn && (
                          <span className="block font-mono text-[9px] text-zinc-400">
                            HSN: {item.hsn}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 font-mono text-[11px] text-zinc-600">
                        {item.batchNumber}
                      </td>
                      <td className="px-2 py-2 text-center font-bold">
                        {item.quantity}
                      </td>
                      <td className="px-2 py-2 text-right text-zinc-600">
                        ₹{item.mrp.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-center text-zinc-500">
                        {item.gstPercent}%
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-zinc-900">
                        ₹{item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>{formatCurrency(invoiceDetails.invoice.subtotal)}</span>
              </div>
              {invoiceDetails.invoice.discount > 0 && (
                <div className="flex justify-between font-medium text-emerald-700">
                  <span>Discount</span>
                  <span>
                    - {formatCurrency(invoiceDetails.invoice.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>GST Total</span>
                <span>{formatCurrency(invoiceDetails.invoice.gstTotal)}</span>
              </div>
              {invoiceDetails.invoice.cessTotal > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Cess Total</span>
                  <span>
                    {formatCurrency(invoiceDetails.invoice.cessTotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-zinc-200 border-t pt-2 font-black text-sm text-zinc-950">
                <span>Grand Total</span>
                <span>{formatCurrency(invoiceDetails.invoice.grandTotal)}</span>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex items-center justify-between border-zinc-100 border-t pt-2 sm:justify-between">
          <Button
            className="text-xs"
            onClick={onClose}
            size="sm"
            variant="outline"
          >
            Close
          </Button>
          <Button
            className="gap-1.5 bg-black font-semibold text-white text-xs hover:bg-zinc-800"
            onClick={() => window.print()}
            size="sm"
          >
            <Printer className="size-3.5" />
            <span>Print Receipt</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
