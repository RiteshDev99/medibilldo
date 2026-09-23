"use client";

import { Search } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { FullReportsData } from "@/server/reports";

interface GstTabProps {
  data: FullReportsData;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export function GstTab({ data, searchQuery, onSearchChange }: GstTabProps) {
  const filteredHsn = useMemo(() => {
    if (!searchQuery.trim()) return data.hsnSummary;
    const q = searchQuery.toLowerCase();
    return data.hsnSummary.filter(
      (h) =>
        h.hsn.toLowerCase().includes(q) ||
        h.medicineNames.some((m) => m.toLowerCase().includes(q))
    );
  }, [data.hsnSummary, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Slab-wise Summary */}
      <Card className="border-zinc-200 bg-white shadow-2xs">
        <CardHeader className="border-zinc-100 border-b pb-3">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="font-extrabold text-base text-zinc-900">
                GST Rate Slab Breakdown (GSTR-1 Format)
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Taxable turnovers and tax collected categorized by statutory GST
                slabs
              </CardDescription>
            </div>
            <Badge className="w-fit font-bold text-[10px]" variant="outline">
              GSTIN: {data.storeInfo.gstNumber || "Not Configured"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-zinc-200 border-b bg-zinc-50 font-bold text-[10px] text-zinc-600 uppercase tracking-wider">
                  <th className="px-4 py-3">GST Slab</th>
                  <th className="px-4 py-3 text-center">Items Sold</th>
                  <th className="px-4 py-3 text-center">Units Sold</th>
                  <th className="px-4 py-3 text-right">Taxable Turnover (₹)</th>
                  <th className="px-4 py-3 text-right">CGST (₹)</th>
                  <th className="px-4 py-3 text-right">SGST (₹)</th>
                  <th className="px-4 py-3 text-right">Total GST (₹)</th>
                  <th className="px-4 py-3 text-right">Cess (₹)</th>
                  <th className="px-4 py-3 text-right">Total Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.gstSlabs.map((s) => (
                  <tr className="hover:bg-zinc-50" key={s.gstRate}>
                    <td className="px-4 py-3 font-bold text-zinc-900">
                      <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5">
                        {s.gstRate}% Slab
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-600">
                      {s.itemsCount}
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-600">
                      {s.unitsSold}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">
                      {formatCurrency(s.taxableAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-600">
                      {formatCurrency(s.cgstAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-600">
                      {formatCurrency(s.sgstAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-700">
                      {formatCurrency(s.totalGst)}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-600">
                      {formatCurrency(s.cessAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-zinc-950">
                      {formatCurrency(s.totalInvoiceValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-zinc-200 border-t bg-zinc-100/80 font-bold text-zinc-950">
                  <td className="px-4 py-3 text-[11px] uppercase">Total</td>
                  <td className="px-4 py-3 text-center">
                    {data.gstSlabs.reduce((sum, s) => sum + s.itemsCount, 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {data.gstSlabs.reduce((sum, s) => sum + s.unitsSold, 0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(
                      data.gstSlabs.reduce((sum, s) => sum + s.taxableAmount, 0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(
                      data.gstSlabs.reduce((sum, s) => sum + s.cgstAmount, 0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(
                      data.gstSlabs.reduce((sum, s) => sum + s.sgstAmount, 0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-indigo-800">
                    {formatCurrency(data.summary.totalGstCollected)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(data.summary.totalCessCollected)}
                  </td>
                  <td className="px-4 py-3 text-right font-black">
                    {formatCurrency(data.summary.totalGrossSales)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* HSN-wise Sales Summary */}
      <Card className="border-zinc-200 bg-white shadow-2xs">
        <CardHeader className="flex flex-col justify-between gap-3 border-zinc-100 border-b pb-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="font-extrabold text-base text-zinc-900">
              HSN Code-wise Outward Summary
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Harmonized System of Nomenclature breakdown required for GST
              return filing
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-2 left-2.5 size-3.5 text-zinc-400" />
            <Input
              className="h-8 border-zinc-200 bg-zinc-50/50 pl-8 text-xs"
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search HSN code or product..."
              value={searchQuery}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-zinc-200 border-b bg-zinc-50 font-bold text-[10px] text-zinc-600 uppercase tracking-wider">
                  <th className="px-4 py-3">HSN Code</th>
                  <th className="px-4 py-3">Medicines Included</th>
                  <th className="px-4 py-3 text-center">Qty Sold</th>
                  <th className="px-4 py-3 text-right">Taxable Value</th>
                  <th className="px-4 py-3 text-center">GST %</th>
                  <th className="px-4 py-3 text-right">GST Amount</th>
                  <th className="px-4 py-3 text-right">Cess</th>
                  <th className="px-4 py-3 text-right">Total Invoice Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredHsn.length === 0 ? (
                  <tr>
                    <td className="py-10 text-center text-zinc-400" colSpan={8}>
                      No HSN records found.
                    </td>
                  </tr>
                ) : (
                  filteredHsn.map((h, i) => (
                    <tr className="hover:bg-zinc-50" key={`${h.hsn}-${i}`}>
                      <td className="px-4 py-3 font-bold font-mono text-zinc-900">
                        {h.hsn}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-zinc-700">
                        {h.medicineNames.join(", ")}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-zinc-900">
                        {h.totalQuantity}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-900">
                        {formatCurrency(h.taxableAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded bg-zinc-100 px-1.5 py-0.2 font-bold text-[10px] text-zinc-700">
                          {h.gstRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-700">
                        {formatCurrency(h.gstAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-500">
                        {formatCurrency(h.cessAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-zinc-950">
                        {formatCurrency(h.totalAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
