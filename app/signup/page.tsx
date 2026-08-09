import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { SignupForm } from "@/components/forms/signup-form";
import { auth } from "@/lib/auth";

export default async function SignupPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}
