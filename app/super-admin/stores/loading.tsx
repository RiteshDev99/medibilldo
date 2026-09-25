import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SuperAdminStoresLoading() {
  return (
    <div className="min-h-screen space-y-6 bg-zinc-50/50 p-6 text-zinc-950 md:p-10">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-56 rounded-lg bg-zinc-200" />
          <Skeleton className="h-4 w-80 rounded bg-zinc-200" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg bg-zinc-200" />
      </div>

      {/* Search Input Skeleton */}
      <div className="flex max-w-md items-center gap-2">
        <Skeleton className="h-10 w-full rounded-lg bg-zinc-200" />
        <Skeleton className="h-10 w-20 rounded-lg bg-zinc-200" />
      </div>

      {/* Table Card Skeleton */}
      <Card className="border-zinc-200 bg-white shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="border-zinc-150 border-b bg-zinc-50">
              <TableRow>
                <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                  Store details
                </TableHead>
                <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                  Contact Info
                </TableHead>
                <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                  Compliance (GSTIN / Drug / Pharmacy)
                </TableHead>
                <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-right font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow
                  key={row}
                  className="border-zinc-150 border-b hover:bg-transparent"
                >
                  <TableCell className="space-y-1.5 py-4">
                    <Skeleton className="h-4 w-40 rounded bg-zinc-100" />
                    <Skeleton className="h-3 w-28 rounded bg-zinc-100" />
                    <Skeleton className="h-2.5 w-20 rounded bg-zinc-100" />
                  </TableCell>
                  <TableCell className="space-y-1 py-4">
                    <Skeleton className="h-3.5 w-24 rounded bg-zinc-100" />
                    <Skeleton className="h-3 w-32 rounded bg-zinc-100" />
                  </TableCell>
                  <TableCell className="space-y-1 py-4">
                    <Skeleton className="h-3.5 w-36 rounded bg-zinc-100" />
                    <Skeleton className="h-3 w-40 rounded bg-zinc-100" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-5 w-16 rounded-full bg-zinc-100" />
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16 rounded bg-zinc-100" />
                      <Skeleton className="h-8 w-20 rounded bg-zinc-100" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
