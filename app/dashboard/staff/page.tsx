import { AccessDenied } from "@/components/access-denied";
import { getStaffManagementData } from "@/server/dashboard";
import { getCurrentStore } from "@/server/store";
import { getCurrentUser } from "@/server/users";
import { StaffClient } from "./staff-client";

export default async function StaffPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  if (user.role !== "ADMIN") {
    return <AccessDenied />;
  }

  const currentStore = await getCurrentStore();
  if (!currentStore) {
    return (
      <div className="p-6 text-center md:p-10">
        <p className="font-semibold text-sm text-zinc-800">
          No store profile associated.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Please configure your store profile first.
        </p>
      </div>
    );
  }

  const staffData = await getStaffManagementData(currentStore.id);

  return <StaffClient initialData={staffData} />;
}
