"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { FullReportsData } from "@/server/reports";

interface InventoryTabProps {
  data: FullReportsData;
}

export function InventoryTab({ data }: InventoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Inventory Valuation Header Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="border-zinc-200 bg-white p-4">
          <span className="font-bold text-[10px] text-zinc-500 uppercase">
            Active Medicines
          </span>
          <p className="mt-1 font-black text-xl text-zinc-950">
            {data.inventoryValuation.totalMedicinesCount}
          </p>
          <p className="text-[10px] text-zinc-400">
            {data.inventoryValuation.totalBatchesCount} batches in store
          </p>
        </Card>

        <Card className="border-zinc-200 bg-white p-4">
          <span className="font-bold text-[10px] text-zinc-500 uppercase">
            Total Stock Units
          </span>
          <p className="mt-1 font-black text-xl text-zinc-950">
            {data.inventoryValuation.totalStockUnits.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-zinc-400">Available base inventory</p>
        </Card>

        <Card className="border-zinc-200 bg-white p-4">
          <span className="font-bold text-[10px] text-zinc-500 uppercase">
            Purchasing Valuation
          </span>
          <p className="mt-1 font-black text-xl text-zinc-900">
            {formatCurrency(data.inventoryValuation.costValuation)}
          </p>
          <p className="text-[10px] text-zinc-400">Capital tied in stock</p>
        </Card>

        <Card className="border-zinc-200 bg-white p-4">
          <span className="font-bold text-[10px] text-emerald-700 uppercase">
            Unrealized Retail Profit
          </span>
          <p className="mt-1 font-black text-emerald-700 text-xl">
            {formatCurrency(data.inventoryValuation.potentialProfitValuation)}
          </p>
          <p className="text-[10px] text-emerald-600">
            MRP: {formatCurrency(data.inventoryValuation.mrpValuation)}
          </p>
        </Card>
      </div>

      {/* Expiry Risk & Dead Stock Table */}
      <Card className="border-zinc-200 bg-white shadow-2xs">
        <CardHeader className="flex flex-col justify-between gap-3 border-zinc-100 border-b pb-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 font-extrabold text-base text-zinc-900">
              <AlertTriangle className="size-4 text-amber-500" />
              Expiry Risk & Locked Capital Log
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Batches expiring within 60 days or already expired requiring
              supplier return or disposal
            </CardDescription>
          </div>
          <Badge className="w-fit font-bold text-[10px]" variant="outline">
            {data.expiryAlertBatches.length} Batches Flagged
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-zinc-200 border-b bg-zinc-50 font-bold text-[10px] text-zinc-600 uppercase tracking-wider">
                  <th className="px-4 py-3">Medicine Name</th>
                  <th className="px-4 py-3">Batch Number</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3 text-center">Remaining</th>
                  <th className="px-4 py-3 text-center">Stock Units</th>
                  <th className="px-4 py-3 text-right">Purchase Rate</th>
                  <th className="px-4 py-3 text-right">MRP</th>
                  <th className="px-4 py-3 text-right">Locked Capital (₹)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.expiryAlertBatches.length === 0 ? (
                  <tr>
                    <td className="py-10 text-center text-zinc-400" colSpan={9}>
                      🎉 No near-expiry or expired batches found in inventory.
                    </td>
                  </tr>
                ) : (
                  data.expiryAlertBatches.map((b) => (
                    <tr className="hover:bg-zinc-50" key={b.batchId}>
                      <td className="px-4 py-3 font-bold text-zinc-900">
                        {b.medicineName}
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-700">
                        {b.batchNumber}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {b.expiryDate}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {b.isExpired ? (
                          <span className="font-bold text-rose-600">
                            Expired
                          </span>
                        ) : (
                          <span className="text-amber-700">
                            {b.daysRemaining} days
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-zinc-900">
                        {b.stockQuantity}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600">
                        {formatCurrency(b.purchaseRate)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600">
                        {formatCurrency(b.mrp)}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-rose-700">
                        {formatCurrency(b.lockedCostValuation)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {b.isExpired ? (
                          <span className="rounded border border-rose-200 bg-rose-100 px-2 py-0.5 font-black text-[10px] text-rose-800">
                            EXPIRED
                          </span>
                        ) : (
                          <span className="rounded border border-amber-200 bg-amber-100 px-2 py-0.5 font-black text-[10px] text-amber-800">
                            EXPIRING SOON
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Movement In Period */}
      {data.stockMovements.length > 0 && (
        <Card className="border-zinc-200 bg-white shadow-2xs">
          <CardHeader className="border-zinc-100 border-b pb-3">
            <CardTitle className="font-extrabold text-sm text-zinc-900">
              Stock Movements In Timeframe ({data.timeframe.label})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {data.stockMovements.map((mov) => (
                <div
                  className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-center"
                  key={mov.type}
                >
                  <span className="font-bold text-[10px] text-zinc-500 uppercase">
                    {mov.type}
                  </span>
                  <p className="mt-1 font-black text-lg text-zinc-950">
                    {mov.totalQuantity} units
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {mov.movementsCount} operations
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
