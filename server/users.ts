"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser) {
    redirect("/login");
  }

  return {
    ...session,
    currentUser,
  };
};

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};



export const getAllUsers = async () => {
  try {
    const users = await db.query.user.findMany({
      orderBy: (user, { desc }) => [desc(user.createdAt)],
    });
    return users;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createStaff = async (data: { name: string; email: string; phone?: string; password?: string }) => {
  try {
    const session = await getCurrentUser();
    const currentUser = session.currentUser;

    if (currentUser.role !== "ADMIN") {
      return { success: false, error: "Access denied. Store Admin role required." };
    }

    if (!currentUser.storeId) {
      return { success: false, error: "Store Admin does not have an assigned store." };
    }

    if (!data.name || !data.email || !data.password) {
      return { success: false, error: "Name, email, and password are required." };
    }

    // Check email uniqueness
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, data.email),
    });

    if (existingUser) {
      return { success: false, error: "This email is already registered." };
    }

    // Create staff user in Better Auth
    const newUser = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: "STAFF",
      },
    });

    if (!newUser || !newUser.user) {
      return { success: false, error: "Failed to create Staff user." };
    }

    // Update staff's storeId to the admin's storeId
    await db
      .update(user)
      .set({ storeId: currentUser.storeId })
      .where(eq(user.id, newUser.user.id));

    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (error) {
    console.error("Error in createStaff:", error);
    const err = error as Error;
    return { success: false, error: err.message || "Failed to create staff member." };
  }
};
