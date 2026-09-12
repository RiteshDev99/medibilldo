import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "@/components/forms/login-form";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  let session: Awaited<ReturnType<typeof auth.api.getSession>> = null;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Failed to retrieve session in LoginPage:", error);
  }

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
