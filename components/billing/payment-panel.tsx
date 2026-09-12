"use client";

import {
  AlertCircle,
  Banknote,
  BookOpen,
  ChevronDown,
  CreditCard,
  Loader2,
  Printer,
  QrCode,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CalculatedInvoiceSummary } from "@/lib/billing-calc";
import { formatINR, round2 } from "@/lib/billing-calc";
import type { SelectedCustomer } from "./customer-panel";

export type PaymentMode = "CASH" | "UPI" | "CARD" | "CREDIT";

interface PaymentPanelProps {
  summary: CalculatedInvoiceSummary;
  customer: SelectedCustomer;
  paymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
  overallDiscountPercent: number;
  onOverallDiscountChange: (discount: number) => void;
  amountReceived: number;
  onAmountReceivedChange: (amount: number) => void;
  onCheckout: (printInvoice: boolean) => Promise<void>;
  isLoading: boolean;
  hasErrors: boolean;
  errorMessage?: string;
  onOpenCustomerModal?: () => void;
}

export function PaymentPanel({
  summary,
  customer,
  paymentMode,
  onPaymentModeChange,
  overallDiscountPercent,
  onOverallDiscountChange,
  amountReceived,
  onAmountReceivedChange,
  onCheckout,
  isLoading,
  hasErrors,
  errorMessage,
  onOpenCustomerModal,
}: PaymentPanelProps) {
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);

  const changeReturned =
    paymentMode === "CASH" && amountReceived >= summary.grandTotal
      ? round2(amountReceived - summary.grandTotal)
      : 0;

  // Auto-fill received amount with grand total when cash is selected
  useEffect(() => {
    if (
      paymentMode === "CASH" &&
      (amountReceived === 0 || amountReceived < summary.grandTotal) &&
      summary.grandTotal > 0
    ) {
      onAmountReceivedChange(summary.grandTotal);
    }
  }, [paymentMode, summary.grandTotal, amountReceived, onAmountReceivedChange]);

  const isCreditBlocked =
    paymentMode === "CREDIT" &&
    !customer.id &&
    (!customer.name || customer.name === "Walk-in Customer" || !customer.phone);

  const canSubmit =
    !(hasErrors || isCreditBlocked) && summary.grandTotal > 0 && !isLoading;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs">
      <div className="space-y-3.5">
        {/* Prominent, Eye-Level Grand Total Display */}
        <div className="rounded-2xl border border-emerald-950/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[11px] text-zinc-400 uppercase tracking-wider">
              Net Payable Amount
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-extrabold font-mono text-[10px] text-emerald-400">
              ALL TAXES INCL
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-black font-mono text-3xl text-emerald-400 tracking-tight sm:text-4xl">
              {formatINR(summary.grandTotal)}
            </span>
            {summary.totalDiscount > 0 && (
              <span className="rounded bg-emerald-900/60 px-1.5 py-0.5 font-bold font-mono text-[10px] text-emerald-300">
                Saved {formatINR(summary.totalDiscount)}
              </span>
            )}
          </div>
        </div>

        {/* Tactile Payment Method Selector */}
        <div>
          <Label className="font-extrabold text-[10px] text-zinc-500 uppercase tracking-wider">
            Payment Mode
          </Label>
          <div className="mt-1.5 grid grid-cols-4 gap-1">
            <button
              className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                paymentMode === "CASH"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-600/30"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() => onPaymentModeChange("CASH")}
              type="button"
            >
              <Banknote className="size-4" />
              <span className="mt-1 font-extrabold text-[11px]">Cash</span>
            </button>

            <button
              className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                paymentMode === "UPI"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-600/30"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() => onPaymentModeChange("UPI")}
              type="button"
            >
              <QrCode className="size-4" />
              <span className="mt-1 font-extrabold text-[11px]">UPI QR</span>
            </button>

            <button
              className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                paymentMode === "CARD"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-600/30"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() => onPaymentModeChange("CARD")}
              type="button"
            >
              <CreditCard className="size-4" />
              <span className="mt-1 font-extrabold text-[11px]">Card</span>
            </button>

            <button
              className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                paymentMode === "CREDIT"
                  ? "border-amber-600 bg-amber-50 text-amber-900 shadow-xs ring-1 ring-amber-600/30"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() => onPaymentModeChange("CREDIT")}
              type="button"
            >
              <BookOpen className="size-4" />
              <span className="mt-1 font-extrabold text-[11px]">Udhar</span>
            </button>
          </div>
        </div>

        {/* Cash Tender & Instant Change Calculator */}
        {paymentMode === "CASH" && (
          <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-zinc-600">
                Cash Tendered
              </span>
              <div className="flex gap-1">
                <button
                  className="rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 font-bold font-mono text-[10px] text-zinc-700 shadow-2xs hover:bg-zinc-100"
                  onClick={() => onAmountReceivedChange(summary.grandTotal)}
                  type="button"
                >
                  Exact
                </button>
                <button
                  className="rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 font-bold font-mono text-[10px] text-zinc-700 shadow-2xs hover:bg-zinc-100"
                  onClick={() =>
                    onAmountReceivedChange(
                      Math.ceil(summary.grandTotal / 100) * 100 || 100
                    )
                  }
                  type="button"
                >
                  Round 100
                </button>
                <button
                  className="rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 font-bold font-mono text-[10px] text-zinc-700 shadow-2xs hover:bg-zinc-100"
                  onClick={() =>
                    onAmountReceivedChange(
                      Math.ceil(summary.grandTotal / 500) * 500 || 500
                    )
                  }
                  type="button"
                >
                  ₹500
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Input
                  className="h-9 rounded-lg border-zinc-300 bg-white pr-7 font-black font-mono text-sm text-zinc-950"
                  min="0"
                  onChange={(e) =>
                    onAmountReceivedChange(
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  step="1"
                  type="number"
                  value={amountReceived || ""}
                />
                <span className="pointer-events-none absolute top-2 right-2 text-xs text-zinc-400">
                  ₹
                </span>
              </div>

              <div className="flex flex-col justify-center rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-right">
                <span className="font-bold text-[9px] text-zinc-400 uppercase">
                  Change to Return
                </span>
                <span
                  className={`font-black font-mono text-sm ${
                    changeReturned > 0 ? "text-emerald-700" : "text-zinc-600"
                  }`}
                >
                  {formatINR(changeReturned)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* UPI Helper Info */}
        {paymentMode === "UPI" && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 text-emerald-900 text-xs">
            <QrCode className="size-5 shrink-0 text-emerald-700" />
            <div>
              <p className="font-bold">Ask customer to scan store QR code</p>
              <p className="text-[11px] text-emerald-800/80">
                Collect exact amount of{" "}
                <strong>{formatINR(summary.grandTotal)}</strong> via GPay,
                PhonePe, or Paytm.
              </p>
            </div>
          </div>
        )}

        {/* Credit / Udhar Validation Info */}
        {paymentMode === "CREDIT" && (
          <div
            className={`rounded-xl border p-2.5 text-xs ${
              isCreditBlocked
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-amber-300 bg-amber-50 text-amber-900"
            }`}
          >
            {isCreditBlocked ? (
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="size-4 shrink-0 text-red-600" />
                  <span>
                    Credit requires an identified customer with mobile number.
                  </span>
                </div>
                {onOpenCustomerModal && (
                  <Button
                    className="h-6 text-[10px]"
                    onClick={onOpenCustomerModal}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Select
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <BookOpen className="size-4 shrink-0 text-amber-700" />
                <span>
                  <strong>{formatINR(summary.grandTotal)}</strong> will be added
                  to <strong>{customer.name}</strong>&apos;s credit ledger.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Compact Bill Summary + Expandable Tax Details */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-2.5 text-xs">
          <div className="flex items-center justify-between font-medium text-zinc-600">
            <span>Gross Total</span>
            <span className="font-mono text-zinc-900">
              {formatINR(summary.grossTotal)}
            </span>
          </div>

          {summary.totalDiscount > 0 && (
            <div className="mt-1 flex items-center justify-between font-semibold text-emerald-700">
              <span>Total Discount</span>
              <span className="font-mono">
                -{formatINR(summary.totalDiscount)}
              </span>
            </div>
          )}

          {/* Overall Bill Discount % Input */}
          <div className="mt-1.5 flex items-center justify-between border-zinc-200/70 border-t pt-1.5">
            <span className="text-zinc-600">Extra Bill Discount</span>
            <div className="flex items-center gap-1">
              <Input
                className="h-6 w-14 rounded-md border-zinc-200 bg-white text-right font-bold text-xs shadow-2xs"
                max="100"
                min="0"
                onChange={(e) =>
                  onOverallDiscountChange(
                    Number.parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0"
                type="number"
                value={overallDiscountPercent || ""}
              />
              <span className="font-bold text-[11px] text-zinc-400">%</span>
            </div>
          </div>

          {/* Collapsible Tax Breakdown */}
          <div className="mt-2 border-zinc-200/70 border-t pt-1.5">
            <button
              className="flex w-full items-center justify-between text-[11px] text-zinc-500 hover:text-zinc-800"
              onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
              type="button"
            >
              <span>GST Breakdown (Included)</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-semibold text-zinc-700">
                  {formatINR(summary.gstTotal)}
                </span>
                <ChevronDown
                  className={`size-3 transition-transform ${
                    showTaxBreakdown ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {showTaxBreakdown && (
              <div className="mt-2 space-y-1 rounded-lg bg-white p-2 font-mono text-[10px] text-zinc-500 shadow-2xs">
                <div className="flex justify-between">
                  <span>Taxable Subtotal:</span>
                  <span>{formatINR(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (Central Tax):</span>
                  <span>{formatINR(summary.cgstTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (State Tax):</span>
                  <span>{formatINR(summary.sgstTotal)}</span>
                </div>
                {summary.roundOff !== 0 && (
                  <div className="flex justify-between">
                    <span>Round Off:</span>
                    <span>
                      {summary.roundOff > 0
                        ? `+${summary.roundOff}`
                        : summary.roundOff}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Warning if any */}
        {hasErrors && errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-700 text-xs">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Primary Action Buttons (Never require scrolling) */}
      <div className="mt-4 space-y-2">
        <Button
          className="h-12 w-full cursor-pointer rounded-xl bg-emerald-600 font-extrabold text-sm text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg disabled:opacity-40"
          disabled={!canSubmit}
          onClick={() => onCheckout(true)}
          type="button"
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Printer className="mr-2 size-4" />
          )}
          Save & Print Bill (F4)
        </Button>

        <Button
          className="h-9 w-full cursor-pointer rounded-xl font-bold text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
          disabled={!canSubmit}
          onClick={() => onCheckout(false)}
          type="button"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <Save className="mr-1.5 size-3.5 text-zinc-500" />
          )}
          Save Without Printing
        </Button>
      </div>
    </div>
  );
}
