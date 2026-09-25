import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  let session: Awaited<ReturnType<typeof auth.api.getSession>> = null;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Failed to retrieve session in Home:", error);
  }

  if (session) {
    if (session.user?.role === "SUPER_ADMIN") {
      redirect("/super-admin");
    } else {
      redirect("/dashboard");
    }
  } else {
    redirect("/login");
  }
}
