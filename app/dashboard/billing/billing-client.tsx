"use client";

import { Clock, Store, UserCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { type CartLineItem, CartTable } from "@/components/billing/cart-table";
import {
  CustomerPanel,
  type SelectedCustomer,
} from "@/components/billing/customer-panel";
import {
  type InvoicePrintData,
  InvoiceReceiptModal,
} from "@/components/billing/invoice-receipt-modal";
import {
  MedicineSearch,
  type SearchMedicineBatch,
  type SearchMedicineItem,
} from "@/components/billing/medicine-search";
import {
  type PaymentMode,
  PaymentPanel,
} from "@/components/billing/payment-panel";
import {
  calculateInvoiceSummary,
  calculateItemTotals,
} from "@/lib/billing-calc";
import { createInvoice, getInvoiceById } from "@/server/billing";

interface BillingClientProps {
  initialStore: {
    storeName: string;
    phone: string;
    address: string;
    drugLicenseNumber: string | null;
    gstNumber: string | null;
  };
  currentUser: {
    name: string;
    email: string;
    role: string;
  };
}

export function BillingClient({
  initialStore,
  currentUser,
}: BillingClientProps) {
  // Cart State
  const [items, setItems] = useState<CartLineItem[]>([]);

  // Customer State
  const [customer, setCustomer] = useState<SelectedCustomer>({
    id: null,
    name: "Walk-in Customer",
    phone: null,
    doctorName: null,
    creditBalance: 0,
  });

  // Payment State
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [overallDiscountPercent, setOverallDiscountPercent] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);

  // Status & Modals
  const [isLoading, setIsLoading] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<InvoicePrintData | null>(null);

  // Search input ref for F2 shortcut
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Current Date & Clock
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const update = () =>
      setCurrentTime(
        new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      );
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Calculate live summary
  const summary = useMemo(() => {
    return calculateInvoiceSummary(
      items.map((it) => it.calc),
      overallDiscountPercent
    );
  }, [items, overallDiscountPercent]);

  // Validation: Check if any item has insufficient stock
  const hasInsufficientStock = useMemo(() => {
    return items.some((it) => it.hasInsufficientStock);
  }, [items]);

  // Add medicine batch to cart
  const handleSelectBatch = useCallback(
    (
      med: SearchMedicineItem,
      batch: SearchMedicineBatch,
      quantity = 1,
      isPack = true
    ) => {
      setItems((prev) => {
        // Check if item with this batch already exists in cart
        const existingIndex = prev.findIndex(
          (it) => it.medicine.id === med.id && it.batch.id === batch.id
        );

        const convFactor = med.conversionFactor || 1;

        if (existingIndex > -1) {
          const existing = prev[existingIndex];
          const newQty = existing.quantity + quantity;
          const calc = calculateItemTotals({
            quantity: newQty,
            isPack: existing.isPack,
            conversionFactor: convFactor,
            packMrp: batch.mrp,
            customRate: existing.customRate,
            discountPercent: existing.discountPercent,
            gstPercent: med.gst,
            cessPercent: med.cess ?? 0,
          });

          const hasInsufficient = calc.baseUnitsSold > batch.stockQuantity;

          const updated = [...prev];
          updated[existingIndex] = {
            ...existing,
            quantity: newQty,
            calc,
            hasInsufficientStock: hasInsufficient,
          };
          return updated;
        }

        // New line item
        const calc = calculateItemTotals({
          quantity,
          isPack,
          conversionFactor: convFactor,
          packMrp: batch.mrp,
          discountPercent: 0,
          gstPercent: med.gst,
          cessPercent: med.cess ?? 0,
        });

        const hasInsufficient = calc.baseUnitsSold > batch.stockQuantity;

        const newItem: CartLineItem = {
          id: crypto.randomUUID(),
          medicine: med,
          batch,
          quantity,
          isPack,
          discountPercent: 0,
          calc,
          hasInsufficientStock: hasInsufficient,
        };

        toast.success(`Added ${med.name} (Batch: ${batch.batchNumber})`);
        return [newItem, ...prev];
      });
    },
    []
  );

  // Update item quantity
  const handleUpdateQuantity = useCallback((id: string, newQty: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const convFactor = item.medicine.conversionFactor || 1;
        const calc = calculateItemTotals({
          quantity: newQty,
          isPack: item.isPack,
          conversionFactor: convFactor,
          packMrp: item.batch.mrp,
          customRate: item.customRate,
          discountPercent: item.discountPercent,
          gstPercent: item.medicine.gst,
          cessPercent: item.medicine.cess ?? 0,
        });

        return {
          ...item,
          quantity: newQty,
          calc,
          hasInsufficientStock: calc.baseUnitsSold > item.batch.stockQuantity,
        };
      })
    );
  }, []);

  // Toggle pack vs loose unit
  const handleToggleUnit = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newIsPack = !item.isPack;
        const convFactor = item.medicine.conversionFactor || 1;
        const calc = calculateItemTotals({
          quantity: item.quantity,
          isPack: newIsPack,
          conversionFactor: convFactor,
          packMrp: item.batch.mrp,
          customRate: item.customRate,
          discountPercent: item.discountPercent,
          gstPercent: item.medicine.gst,
          cessPercent: item.medicine.cess ?? 0,
        });

        return {
          ...item,
          isPack: newIsPack,
          calc,
          hasInsufficientStock: calc.baseUnitsSold > item.batch.stockQuantity,
        };
      })
    );
  }, []);

  // Update item discount %
  const handleUpdateDiscount = useCallback((id: string, newDis: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const convFactor = item.medicine.conversionFactor || 1;
        const calc = calculateItemTotals({
          quantity: item.quantity,
          isPack: item.isPack,
          conversionFactor: convFactor,
          packMrp: item.batch.mrp,
          customRate: item.customRate,
          discountPercent: newDis,
          gstPercent: item.medicine.gst,
          cessPercent: item.medicine.cess ?? 0,
        });

        return {
          ...item,
          discountPercent: newDis,
          calc,
        };
      })
    );
  }, []);

  // Switch batch for an item
  const handleUpdateBatch = useCallback((id: string, newBatchId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newBatch = item.medicine.batches.find((b) => b.id === newBatchId);
        if (!newBatch) return item;

        const convFactor = item.medicine.conversionFactor || 1;
        const calc = calculateItemTotals({
          quantity: item.quantity,
          isPack: item.isPack,
          conversionFactor: convFactor,
          packMrp: newBatch.mrp,
          customRate: item.customRate,
          discountPercent: item.discountPercent,
          gstPercent: item.medicine.gst,
          cessPercent: item.medicine.cess ?? 0,
        });

        return {
          ...item,
          batch: newBatch,
          calc,
          hasInsufficientStock: calc.baseUnitsSold > newBatch.stockQuantity,
        };
      })
    );
  }, []);

  // Remove single item
  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  // Reset cart
  const handleResetBill = useCallback(() => {
    setItems([]);
    setCustomer({
      id: null,
      name: "Walk-in Customer",
      phone: null,
      doctorName: null,
      creditBalance: 0,
    });
    setPaymentMode("CASH");
    setOverallDiscountPercent(0);
    setAmountReceived(0);
    searchInputRef.current?.focus();
  }, []);

  // Checkout and Save Bill
  const handleCheckout = async (printInvoice: boolean) => {
    if (items.length === 0) {
      toast.error("Cart is empty. Please add items to bill.");
      return;
    }

    if (hasInsufficientStock) {
      toast.error(
        "Some items exceed available batch stock. Please adjust quantities."
      );
      return;
    }

    if (
      paymentMode === "CREDIT" &&
      !customer.id &&
      (!customer.name ||
        customer.name === "Walk-in Customer" ||
        !customer.phone)
    ) {
      toast.error(
        "Please identify a registered customer or provide a mobile number for Credit sales."
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await createInvoice({
        items: items.map((it) => ({
          medicineId: it.medicine.id,
          batchId: it.batch.id,
          quantity: it.quantity,
          isPack: it.isPack,
          discountPercent: it.discountPercent,
          customRate: it.customRate,
        })),
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        doctorName: customer.doctorName,
        paymentMode,
        amountReceived:
          paymentMode === "CASH"
            ? amountReceived || summary.grandTotal
            : summary.grandTotal,
        overallDiscountPercent,
      });

      if (res.success && res.invoiceId) {
        toast.success(`Bill #${res.invoiceNumber} created successfully!`);

        // Fetch full bill details for receipt view/printing
        const invDetails = await getInvoiceById(res.invoiceId);
        if (invDetails.success && invDetails.invoice) {
          setReceiptData({
            invoice: invDetails.invoice as any,
            items: (invDetails.items || []) as any,
            store: invDetails.store as any,
            cashierName: invDetails.cashier || currentUser.name,
          });
          setAutoPrintReceipt(printInvoice);
          setIsReceiptOpen(true);
        }

        // Reset the active bill screen
        setItems([]);
        setAmountReceived(0);
      } else {
        toast.error(res.error || "Failed to create invoice");
      }
    } catch (err: any) {
      toast.error(
        err.message || "An unexpected error occurred during billing."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcuts (F2: search, F4: checkout, F8: new bill)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F2" ||
        (e.key === "/" && document.activeElement?.tagName !== "INPUT")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        if (!isLoading && items.length > 0 && !hasInsufficientStock) {
          handleCheckout(true);
        }
      } else if (e.key === "F8") {
        e.preventDefault();
        handleResetBill();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    isLoading,
    items.length,
    hasInsufficientStock,
    handleCheckout,
    handleResetBill,
  ]);

  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      {/* Top Bar: Pharmacy Store Name, Clock, User Info */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-3 shadow-2xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs">
            <Store className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base text-zinc-900 tracking-tight">
                {initialStore.storeName}
              </h1>
              <span className="rounded-full bg-emerald-100 px-2 py-0.2 font-bold font-mono text-[10px] text-emerald-800">
                POS Terminal
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              {initialStore.drugLicenseNumber
                ? `D.L: ${initialStore.drugLicenseNumber} • `
                : ""}
              {initialStore.phone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Clock className="size-3.5" />
            <span className="font-mono">
              {currentTime || "Loading time..."}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1">
            <UserCheck className="size-3.5 text-emerald-600" />
            <span className="text-zinc-600">
              Cashier:{" "}
              <strong className="text-zinc-900">{currentUser.name}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Barcode & Medicine Search Bar */}
      <div>
        <MedicineSearch
          inputRef={searchInputRef}
          onSelectBatch={handleSelectBatch}
        />
      </div>

      {/* Two Column Layout: Left (Cart Table), Right (Customer & Payment) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left 8 Cols: Cart Items */}
        <div className="space-y-4 lg:col-span-8">
          <CartTable
            items={items}
            onClearCart={handleResetBill}
            onRemoveItem={handleRemoveItem}
            onToggleUnit={handleToggleUnit}
            onUpdateBatch={handleUpdateBatch}
            onUpdateDiscount={handleUpdateDiscount}
            onUpdateQuantity={handleUpdateQuantity}
          />
        </div>

        {/* Right 4 Cols: Customer & Payment Sidebar */}
        <div className="space-y-4 lg:col-span-4">
          <CustomerPanel customer={customer} onCustomerChange={setCustomer} />

          <PaymentPanel
            amountReceived={amountReceived}
            customer={customer}
            errorMessage={
              hasInsufficientStock
                ? "Some items exceed available batch stock."
                : undefined
            }
            hasErrors={hasInsufficientStock}
            isLoading={isLoading}
            onAmountReceivedChange={setAmountReceived}
            onCheckout={handleCheckout}
            onOverallDiscountChange={setOverallDiscountPercent}
            onPaymentModeChange={setPaymentMode}
            overallDiscountPercent={overallDiscountPercent}
            paymentMode={paymentMode}
            summary={summary}
          />
        </div>
      </div>

      {/* Invoice Printable Receipt Modal */}
      <InvoiceReceiptModal
        autoPrint={autoPrintReceipt}
        data={receiptData}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onNewBill={handleResetBill}
      />
    </div>
  );
}
