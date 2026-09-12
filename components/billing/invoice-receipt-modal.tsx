"use client";

import { CheckCircle2, Plus, Printer, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatINR } from "@/lib/billing-calc";

export interface InvoicePrintData {
  invoice: {
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerPhone: string | null;
    doctorName: string | null;
    subtotal: number;
    discount: number;
    gstTotal: number;
    cessTotal: number;
    grandTotal: number;
    paymentMode: string;
    amountReceived: number | null;
    changeReturned: number | null;
    createdAt: Date | string;
  };
  items: Array<{
    id: string;
    medicineName: string;
    batchNumber: string;
    expiryDate: Date | string;
    hsn: string | null;
    quantity: number;
    packUnit: string | null;
    unitPrice: number;
    mrp: number;
    discount: number;
    gstPercent: number;
    gstAmount: number;
    total: number;
  }>;
  store: {
    storeName: string;
    legalName: string | null;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNumber: string | null;
    drugLicenseNumber: string | null;
    pharmacyLicenseNumber: string | null;
  } | null;
  cashierName: string;
}

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewBill: () => void;
  data: InvoicePrintData | null;
  autoPrint?: boolean;
}

export function InvoiceReceiptModal({
  isOpen,
  onClose,
  onNewBill,
  data,
  autoPrint = false,
}: InvoiceReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (isOpen && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint]);

  if (!data) return null;

  const { invoice, items, store, cashierName } = data;
  const dateFormatted = new Date(invoice.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-extrabold text-base text-zinc-900">
                Invoice Generated Successfully
              </DialogTitle>
              <p className="font-mono text-xs text-zinc-500">
                Bill #{invoice.invoiceNumber}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Printable Receipt Container */}
        <div
          className="rounded-xl border border-zinc-200 bg-white p-6 font-mono text-xs text-zinc-950 shadow-xs print:m-0 print:border-none print:p-0 print:shadow-none"
          id="printable-receipt"
          ref={receiptRef}
        >
          {/* Pharmacy Header */}
          <div className="border-zinc-900 border-b pb-3 text-center">
            <h2 className="font-extrabold text-base text-zinc-950 uppercase tracking-wide">
              {store?.storeName || "Pharmacy Store"}
            </h2>
            {store?.legalName && store.legalName !== store.storeName && (
              <p className="text-[11px] text-zinc-600">({store.legalName})</p>
            )}
            <p className="mt-0.5 text-[11px] text-zinc-600">
              {store?.address}, {store?.city}, {store?.state} - {store?.pincode}
            </p>
            <p className="text-[11px] text-zinc-600">
              Phone: <strong>{store?.phone}</strong>
            </p>

            <div className="mt-1 flex flex-wrap justify-center gap-3 text-[10px] text-zinc-700">
              {store?.drugLicenseNumber && (
                <span>
                  D.L. No: <strong>{store.drugLicenseNumber}</strong>
                </span>
              )}
              {store?.gstNumber && (
                <span>
                  GSTIN: <strong>{store.gstNumber}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Tax Invoice Banner */}
          <div className="border-zinc-400 border-b border-dashed py-2 text-center">
            <span className="font-extrabold text-xs text-zinc-900 uppercase tracking-widest">
              RETAIL TAX INVOICE
            </span>
          </div>

          {/* Bill Meta Details */}
          <div className="grid grid-cols-2 gap-2 border-zinc-400 border-b border-dashed py-2.5 text-[11px]">
            <div>
              <p>
                Bill No: <strong>{invoice.invoiceNumber}</strong>
              </p>
              <p>Date: {dateFormatted}</p>
              <p>Cashier: {cashierName}</p>
            </div>
            <div className="text-right">
              <p>
                Patient: <strong>{invoice.customerName}</strong>
              </p>
              {invoice.customerPhone && <p>Phone: {invoice.customerPhone}</p>}
              {invoice.doctorName && <p>Doctor: {invoice.doctorName}</p>}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-2">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-zinc-900 border-b font-bold text-[10px] text-zinc-700 uppercase">
                  <th className="py-1">Item</th>
                  <th className="py-1">Batch</th>
                  <th className="py-1">Exp</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Rate</th>
                  <th className="py-1 text-right">GST</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-zinc-200">
                {items.map((it) => (
                  <tr className="py-1" key={it.id}>
                    <td className="py-1 pr-1 font-bold font-sans text-zinc-900">
                      {it.medicineName}
                    </td>
                    <td className="py-1 text-[10px]">{it.batchNumber}</td>
                    <td className="py-1 text-[10px]">
                      {new Date(it.expiryDate).toLocaleDateString("en-IN", {
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="py-1 text-center font-bold">
                      {it.quantity}
                    </td>
                    <td className="py-1 text-right">
                      ₹{it.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-1 text-right text-[10px]">
                      {it.gstPercent}%
                    </td>
                    <td className="py-1 text-right font-bold text-zinc-950">
                      ₹{it.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Breakdown */}
          <div className="border-zinc-900 border-t pt-2 text-[11px]">
            <div className="flex justify-between py-0.5">
              <span>Taxable Subtotal:</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between py-0.5 text-emerald-800">
                <span>Discount:</span>
                <span>-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-0.5">
              <span>CGST (Central Tax):</span>
              <span>₹{(invoice.gstTotal / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>SGST (State Tax):</span>
              <span>₹{(invoice.gstTotal / 2).toFixed(2)}</span>
            </div>

            <div className="mt-1.5 flex justify-between border-zinc-900 border-t-2 py-1.5 font-extrabold text-sm text-zinc-950">
              <span>GRAND TOTAL:</span>
              <span>{formatINR(invoice.grandTotal)}</span>
            </div>

            <div className="flex justify-between border-zinc-300 border-t border-dashed pt-1 text-[10px] text-zinc-600">
              <span>
                Payment Mode: <strong>{invoice.paymentMode}</strong>
              </span>
              {invoice.paymentMode === "CASH" && invoice.amountReceived && (
                <span>
                  Recv: ₹{invoice.amountReceived.toFixed(2)} | Change: ₹
                  {(invoice.changeReturned || 0).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Disclaimer & Footer */}
          <div className="mt-4 border-zinc-400 border-t border-dashed pt-3 text-center text-[9px] text-zinc-500 leading-tight">
            <p>
              1. Goods once sold cannot be returned without original cash memo.
            </p>
            <p>
              2. Schedule H/H1/X drugs sold strictly against registered medical
              prescription.
            </p>
            <p className="mt-1 font-bold text-zinc-700">
              *** Thank You! Wish You A Speedy Recovery ***
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 border-zinc-100 border-t pt-3 print:hidden">
          <Button
            className="text-xs"
            onClick={onClose}
            size="sm"
            type="button"
            variant="outline"
          >
            <X className="mr-1.5 size-3.5" />
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              className="font-bold text-xs text-zinc-800"
              onClick={handlePrint}
              size="sm"
              type="button"
              variant="outline"
            >
              <Printer className="mr-1.5 size-3.5" />
              Print Receipt
            </Button>

            <Button
              className="bg-emerald-600 font-bold text-white text-xs hover:bg-emerald-700"
              onClick={() => {
                onClose();
                onNewBill();
              }}
              size="sm"
              type="button"
            >
              <Plus className="mr-1.5 size-3.5" />
              New Bill (F8)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
