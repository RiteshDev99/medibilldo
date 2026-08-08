"use server";

import { db } from "@/db/drizzle";
import { medicine } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "./users";
import { revalidatePath } from "next/cache";

export async function getMedicines() {
  try {
    const data = await db.query.medicine.findMany({
      orderBy: [desc(medicine.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to get medicines:", error);
    return { success: false, error: "Failed to fetch medicines" };
  }
}

export async function createMedicine(data: {
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  hsn?: string;
  gst: number;
  mrp: number;
  status: string;
}) {
  try {
    const session = await getCurrentUser();
    if (session.currentUser.role !== "ADMIN") {
      return { success: false, error: "Access denied. Admin role required." };
    }

    const id = crypto.randomUUID();
    await db.insert(medicine).values({
      id,
      name: data.name,
      genericName: data.genericName,
      category: data.category,
      manufacturer: data.manufacturer,
      hsn: data.hsn || null,
      gst: data.gst,
      mrp: data.mrp,
      status: data.status || "ACTIVE",
    });

    revalidatePath("/dashboard/medicines");
    return { success: true };
  } catch (error) {
    console.error("Failed to create medicine:", error);
    return { success: false, error: "Failed to create medicine" };
  }
}

export async function updateMedicine(
  id: string,
  data: {
    name: string;
    genericName: string;
    category: string;
    manufacturer: string;
    hsn?: string;
    gst: number;
    mrp: number;
    status: string;
  }
) {
  try {
    const session = await getCurrentUser();
    if (session.currentUser.role !== "ADMIN") {
      return { success: false, error: "Access denied. Admin role required." };
    }

    await db
      .update(medicine)
      .set({
        name: data.name,
        genericName: data.genericName,
        category: data.category,
        manufacturer: data.manufacturer,
        hsn: data.hsn || null,
        gst: data.gst,
        mrp: data.mrp,
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(medicine.id, id));

    revalidatePath("/dashboard/medicines");
    return { success: true };
  } catch (error) {
    console.error("Failed to update medicine:", error);
    return { success: false, error: "Failed to update medicine" };
  }
}

export async function deleteMedicine(id: string) {
  try {
    const session = await getCurrentUser();
    if (session.currentUser.role !== "ADMIN") {
      return { success: false, error: "Access denied. Admin role required." };
    }

    await db.delete(medicine).where(eq(medicine.id, id));

    revalidatePath("/dashboard/medicines");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete medicine:", error);
    return { success: false, error: "Failed to delete medicine" };
  }
}
