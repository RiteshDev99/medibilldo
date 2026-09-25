import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
          <FileQuestion className="size-6" />
        </div>
        <span className="font-bold text-xs uppercase tracking-wider text-zinc-400">
          404 Error
        </span>
        <h1 className="mt-1 font-extrabold text-2xl tracking-tight text-zinc-900">
          Page Not Found
        </h1>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          The page you are looking for doesn&apos;t exist, has been moved, or you may not have permission to view it.
        </p>

        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs py-2 px-4 rounded-lg">
              <Home className="size-3.5" />
              Back to Safety
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
