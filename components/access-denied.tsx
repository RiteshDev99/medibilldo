import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-zinc-50/50 p-6 text-center">
      <div className="mb-4 flex size-16 animate-pulse items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
        <ShieldAlert className="size-8" />
      </div>
      <h1 className="font-extrabold text-2xl text-zinc-900 tracking-tight">
        Access Restricted
      </h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500 leading-relaxed">
        This section is reserved for administrative accounts only. Your current
        staff credentials do not permit access to this module.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard">
          <Button className="bg-black font-semibold text-white transition-colors hover:bg-zinc-800">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
