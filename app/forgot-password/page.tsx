import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-bold text-xl tracking-tight"
          href="/"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-black font-extrabold text-sm text-white tracking-tighter shadow-sm">
            mb
          </div>
          medibilldo
        </Link>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
