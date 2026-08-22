import { AccessDenied } from "@/components/access-denied";
import { getCurrentUser } from "@/server/users";
import { getCurrentStore } from "@/server/store";
import { db } from "@/db/drizzle";
import { user as userTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { StaffClient } from "./staff-client";
import type { User as DbUser } from "@/db/schema";

export default async function StaffPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  if (user.role !== "ADMIN") {
    return <AccessDenied />;
  }

  const currentStore = await getCurrentStore();
  if (!currentStore) {
    return (
      <div className="p-6 md:p-10 text-center">
        <p className="font-semibold text-sm text-zinc-800">No store profile associated.</p>
        <p className="mt-1 text-xs text-zinc-500">Please configure your store profile first.</p>
      </div>
    );
  }

  // Fetch all staff members linked to this store
  const staffList = await db.query.user.findMany({
    where: and(
      eq(userTable.storeId, currentStore.id),
      eq(userTable.role, "STAFF")
    ),
    orderBy: [desc(userTable.createdAt)],
  });

  const staffMembers: DbUser[] = staffList || [];

  return <StaffClient initialStaff={staffMembers} />;
}
