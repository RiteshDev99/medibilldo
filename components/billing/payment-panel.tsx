"use client";

import {
  AlertCircle,
  Banknote,
  BookOpen,
  CreditCard,
  Loader2,
  Printer,
  QrCode,
  Save,
} from "lucide-react";
import { useEffect } from "react";
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
}: PaymentPanelProps) {
  const changeReturned =
    paymentMode === "CASH" && amountReceived >= summary.grandTotal
      ? round2(amountReceived - summary.grandTotal)
      : 0;

  // Auto-set received amount when payment mode or grand total changes
  useEffect(() => {
    if (
      paymentMode === "CASH" &&
      amountReceived === 0 &&
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
    <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="space-y-4">
        {/* Payment Mode Selector */}
        <div>
          <Label className="font-extrabold text-[10px] text-zinc-500 uppercase tracking-wider">
            Payment Method
          </Label>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            <button
              className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                paymentMode === "CASH"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() => onPaymentModeChange("CASH")}
              type="button"
            >
              <Banknote className="size-4" />
              <span className="mt-1 font-extrabold text-[11px]">Cash</span>
            </button>

            <button
              className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                paymentMode === "UPI"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() => onPaymentModeChange("UPI")}
              type="button"
            >
              <QrCode className="size-4" />
              <span className="mt-1 font-extrabold text-[11px]">UPI / QR</span>
            </button>

            <button
              className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                paymentMode === "CARD"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() => onPaymentModeChange("CARD")}
              type="button"
            >
              <CreditCard className="size-4" />
              <span className="mt-1 font-extrabold text-[11px]">Card</span>
            </button>

            <button
              className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                paymentMode === "CREDIT"
                  ? "border-amber-600 bg-amber-50 text-amber-900 shadow-2xs"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() => onPaymentModeChange("CREDIT")}
              type="button"
            >
              <BookOpen className="size-4" />
              <span className="mt-1 font-extrabold text-[11px]">Credit</span>
            </button>
          </div>
        </div>

        {/* Cash Tender Calculator */}
        {paymentMode === "CASH" && (
          <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-[11px] text-zinc-600">
                Cash Received (₹)
              </Label>
              <div className="flex gap-1 text-[10px]">
                <button
                  className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-bold font-mono hover:bg-zinc-100"
                  onClick={() => onAmountReceivedChange(summary.grandTotal)}
                  type="button"
                >
                  Exact
                </button>
                <button
                  className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-bold font-mono hover:bg-zinc-100"
                  onClick={() =>
                    onAmountReceivedChange(
                      Math.ceil(summary.grandTotal / 100) * 100 ||
                        summary.grandTotal
                    )
                  }
                  type="button"
                >
                  Round 100
                </button>
                <button
                  className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-bold font-mono hover:bg-zinc-100"
                  onClick={() =>
                    onAmountReceivedChange(
                      Math.ceil(summary.grandTotal / 500) * 500 || 500
                    )
                  }
                  type="button"
                >
                  500
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                className="h-9 font-extrabold font-mono text-sm"
                min="0"
                onChange={(e) =>
                  onAmountReceivedChange(Number.parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                step="1"
                type="number"
                value={amountReceived || ""}
              />

              <div className="flex flex-col justify-center rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-right">
                <span className="font-bold text-[9px] text-zinc-400 uppercase">
                  Change to Return
                </span>
                <span
                  className={`font-extrabold font-mono text-xs ${
                    changeReturned > 0 ? "text-emerald-700" : "text-zinc-600"
                  }`}
                >
                  {formatINR(changeReturned)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Credit / Udhar Warning */}
        {paymentMode === "CREDIT" && (
          <div
            className={`rounded-lg border p-3 text-xs leading-relaxed ${
              isCreditBlocked
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-amber-300 bg-amber-50 text-amber-900"
            }`}
          >
            {isCreditBlocked ? (
              <div className="flex items-start gap-1.5">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>
                  Credit sales require an identified customer with contact
                  number. Select or register a customer in the Customer panel.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5">
                <BookOpen className="size-4 shrink-0 text-amber-700" />
                <span>
                  <strong>{formatINR(summary.grandTotal)}</strong> will be added
                  to <strong>{customer.name}</strong>&apos;s outstanding
                  balance.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Bill Summary Breakdown */}
        <div className="space-y-1.5 border-zinc-100 border-t pt-3 text-xs">
          <div className="flex justify-between text-zinc-500">
            <span>Items Gross Total</span>
            <span className="font-mono font-semibold text-zinc-700">
              {formatINR(summary.grossTotal)}
            </span>
          </div>

          {summary.totalDiscount > 0 && (
            <div className="flex justify-between font-medium text-emerald-700">
              <span>Total Discount</span>
              <span className="font-bold font-mono">
                -{formatINR(summary.totalDiscount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-zinc-500">
            <span>Taxable Subtotal</span>
            <span className="font-mono text-zinc-700">
              {formatINR(summary.subtotal)}
            </span>
          </div>

          <div className="flex justify-between text-zinc-500">
            <span>CGST</span>
            <span className="font-mono text-zinc-700">
              {formatINR(summary.cgstTotal)}
            </span>
          </div>

          <div className="flex justify-between text-zinc-500">
            <span>SGST</span>
            <span className="font-mono text-zinc-700">
              {formatINR(summary.sgstTotal)}
            </span>
          </div>

          {summary.roundOff !== 0 && (
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Round Off</span>
              <span className="font-mono">
                {summary.roundOff > 0
                  ? `+${summary.roundOff}`
                  : summary.roundOff}
              </span>
            </div>
          )}
        </div>

        {/* Overall Discount Input */}
        <div className="flex items-center justify-between border-zinc-100 border-t pt-2 text-xs">
          <span className="font-semibold text-zinc-600">Bill Discount</span>
          <div className="flex items-center gap-1">
            <Input
              className="h-7 w-16 text-right font-bold text-xs"
              max="100"
              min="0"
              onChange={(e) =>
                onOverallDiscountChange(Number.parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              type="number"
              value={overallDiscountPercent || ""}
            />
            <span className="font-bold text-zinc-400">%</span>
          </div>
        </div>

        {/* Prominent Grand Total Display */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900 p-4 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[11px] text-zinc-400 uppercase tracking-wider">
              Grand Total
            </span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-[10px] text-emerald-400">
              GST INCL
            </span>
          </div>
          <div className="mt-1 font-extrabold font-mono text-3xl text-emerald-400 tracking-tight">
            {formatINR(summary.grandTotal)}
          </div>
        </div>

        {/* Error Warning if any */}
        {hasErrors && errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-red-700 text-xs">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="mt-5 space-y-2">
        <Button
          className="h-11 w-full cursor-pointer rounded-xl bg-emerald-600 font-extrabold text-sm text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
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
          className="h-9 w-full cursor-pointer font-bold text-xs text-zinc-800 hover:bg-zinc-50"
          disabled={!canSubmit}
          onClick={() => onCheckout(false)}
          type="button"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-3.5 animate-spin" />
          ) : (
            <Save className="mr-2 size-3.5" />
          )}
          Save Bill Only
        </Button>
      </div>
    </div>
  );
}
