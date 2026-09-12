"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const isAdmin = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session?.user?.role === "ADMIN";
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const isSuperAdmin = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session?.user?.role === "SUPER_ADMIN";
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const requireSuperAdmin = async () => {
  let session: Awaited<ReturnType<typeof auth.api.getSession>> = null;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Failed to retrieve session in requireSuperAdmin:", error);
  }

  if (!session || session.user?.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const { getCurrentUser } = await import("./users");
  return getCurrentUser();
};
