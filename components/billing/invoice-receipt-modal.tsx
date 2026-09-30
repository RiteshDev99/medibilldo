"use client";

import { CheckCircle2, Plus, Printer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatINR } from "@/lib/billing-calc";
import { cn } from "@/lib/utils";

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
  const [paperFormat, setPaperFormat] = useState<"thermal" | "a4">("thermal");

  const handlePrint = () => {
    if (!receiptRef.current) {
      window.print();
      return;
    }

    const content = receiptRef.current.innerHTML;
    const isThermal = paperFormat === "thermal";

    // Create an isolated hidden iframe dedicated to printing the receipt
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice #${invoice.invoiceNumber}</title>
          <style>
            @page {
              size: auto;
              margin: ${isThermal ? "2mm" : "8mm"};
            }
            *, *::before, *::after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            html, body {
              background: #fff;
              color: #000;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              font-size: ${isThermal ? "11px" : "12px"};
              line-height: 1.35;
              width: 100%;
              margin: 0 auto;
              padding: ${isThermal ? "1mm" : "4mm"};
            }
            .receipt-body {
              width: 100%;
              max-width: ${isThermal ? "74mm" : "185mm"};
              margin: 0 auto;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 2px 1px;
            }
            .border-b { border-bottom: 1px solid #000; }
            .border-t { border-top: 1px solid #000; }
            .border-t-2 { border-top: 2px solid #000; }
            .border-dashed { border-style: dashed; }
            .border-zinc-900 { border-color: #000; }
            .border-zinc-400 { border-color: #71717a; }
            .border-zinc-300 { border-color: #a1a1aa; }
            .border-zinc-200 { border-color: #e4e4e7; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: 700; }
            .font-extrabold { font-weight: 800; }
            .font-semibold { font-weight: 600; }
            .uppercase { text-transform: uppercase; }
            .tracking-wide { letter-spacing: 0.025em; }
            .tracking-wider { letter-spacing: 0.05em; }
            .tracking-widest { letter-spacing: 0.1em; }
            .flex { display: flex; }
            .flex-wrap { flex-wrap: wrap; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .gap-2 { gap: 8px; }
            .gap-3 { gap: 12px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr; }
            .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .py-2\\.5 { padding-top: 10px; padding-bottom: 10px; }
            .pt-1 { padding-top: 4px; }
            .pt-2 { padding-top: 8px; }
            .pt-3 { padding-top: 12px; }
            .pb-3 { padding-bottom: 12px; }
            .mt-0\\.5 { margin-top: 2px; }
            .mt-1 { margin-top: 4px; }
            .mt-1\\.5 { margin-top: 6px; }
            .mt-4 { margin-top: 14px; }
            .text-xs { font-size: 11px; }
            .text-sm { font-size: 13px; }
            .text-base { font-size: 15px; }
            .text-\\[9px\\] { font-size: 9px; }
            .text-\\[10px\\] { font-size: 10px; }
            .text-\\[11px\\] { font-size: 11px; }
            .leading-tight { line-height: 1.25; }
            .divide-y > * + * { border-top: 1px dashed #e4e4e7; }
          </style>
        </head>
        <body>
          <div class="receipt-body">
            ${content}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Print error:", err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }
    }, 250);
  };

  useEffect(() => {
    if (isOpen && autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint, paperFormat]);

  if (!data) return null;

  const { invoice, items, store, cashierName } = data;
  const dateFormatted = new Date(invoice.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl print:m-0 print:border-none print:p-0 print:shadow-none print:max-h-none print:w-full print:max-w-none print:overflow-visible print:bg-transparent print:static print:transform-none">
        <DialogHeader className="print:hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

            {/* Paper Format Selector */}
            <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-[11px] font-semibold text-zinc-600">
              <button
                type="button"
                onClick={() => setPaperFormat("thermal")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-all",
                  paperFormat === "thermal"
                    ? "bg-white text-zinc-950 font-bold shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                Thermal (80mm)
              </button>
              <button
                type="button"
                onClick={() => setPaperFormat("a4")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-all",
                  paperFormat === "a4"
                    ? "bg-white text-zinc-950 font-bold shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                Full / A4
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Printable Receipt Container */}
        <div
          className={cn(
            "rounded-xl border border-zinc-200 bg-white p-6 font-mono text-xs text-zinc-950 shadow-xs",
            "print:m-0 print:border-none print:p-1 print:shadow-none print:w-full print:break-inside-avoid print:page-break-inside-avoid print:break-after-avoid print:page-break-after-avoid",
            paperFormat === "thermal"
              ? "max-w-[340px] mx-auto print:max-w-[76mm]"
              : "w-full print:max-w-[190mm]"
          )}
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
