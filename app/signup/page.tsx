import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignupForm } from "@/components/forms/signup-form";
import { AuthLayout } from "@/components/auth-layout";

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
