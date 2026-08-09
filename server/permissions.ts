"use server";

import { headers } from "next/headers";
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
