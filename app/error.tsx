"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="size-6" />
        </div>
        <h1 className="font-extrabold text-xl tracking-tight text-zinc-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          An unexpected error occurred while processing your request. Please try again or return home.
        </p>

        {error.digest && (
          <p className="mt-2 text-[10px] text-zinc-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            onClick={() => reset()}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs py-2 px-4 rounded-lg"
          >
            <RefreshCw className="size-3.5" />
            Try Again
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-1.5 border-zinc-200 text-zinc-700 font-medium text-xs py-2 px-4 rounded-lg"
            >
              <Home className="size-3.5" />
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
