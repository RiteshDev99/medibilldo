import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuperAdminLoading() {
  return (
    <div className="min-h-screen space-y-8 bg-zinc-50/50 p-6 text-zinc-950 md:p-10">
      {/* Welcome Banner Skeleton */}
      <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-6 shadow-md md:flex-row md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.06] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="relative z-10 w-full flex-1 space-y-4 text-center md:text-left">
          <div className="space-y-3">
            <Skeleton className="mx-auto h-5 w-32 rounded-full bg-zinc-800 md:mx-0" />
            <Skeleton className="mx-auto h-9 w-64 rounded-lg bg-zinc-800 md:mx-0 md:w-80" />
            <Skeleton className="mx-auto h-4 w-full max-w-lg rounded bg-zinc-800/80 md:mx-0" />
            <Skeleton className="mx-auto h-4 w-3/4 max-w-md rounded bg-zinc-800/80 md:mx-0" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 md:justify-start">
            <Skeleton className="h-10 w-40 rounded-lg bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="border-zinc-200 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-3.5 w-24 rounded bg-zinc-100" />
              <Skeleton className="size-4 rounded-full bg-zinc-100" />
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <Skeleton className="h-8 w-16 rounded bg-zinc-100" />
              <Skeleton className="h-3 w-32 rounded bg-zinc-100" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit Trail List Skeleton */}
      <Card className="border-zinc-200 bg-white shadow-xs">
        <CardHeader className="border-zinc-100 border-b pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded bg-zinc-100" />
            <Skeleton className="h-5 w-44 rounded bg-zinc-100" />
          </div>
          <Skeleton className="mt-1 h-3.5 w-72 rounded bg-zinc-100" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between gap-3 px-6 py-4 sm:flex-row sm:items-center"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded bg-zinc-100" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-36 rounded bg-zinc-100" />
                    <Skeleton className="h-3 w-20 rounded bg-zinc-100" />
                  </div>
                </div>
                <div className="space-y-1.5 sm:text-right">
                  <Skeleton className="h-3.5 w-32 rounded bg-zinc-100 sm:ml-auto" />
                  <Skeleton className="h-3 w-24 rounded bg-zinc-100 sm:ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
