import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-zinc-50/50">
      <div className="size-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-4 text-red-600 animate-pulse">
        <ShieldAlert className="size-8" />
      </div>
      <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Access Restricted</h1>
      <p className="text-zinc-500 text-sm mt-2 max-w-md leading-relaxed">
        This section is reserved for administrative accounts only. Your current staff credentials do not permit access to this module.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard">
          <Button className="bg-black text-white hover:bg-zinc-800 transition-colors font-semibold">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
