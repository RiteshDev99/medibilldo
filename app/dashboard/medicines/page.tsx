import { getMedicines } from "@/server/medicines";
import { getCurrentUser } from "@/server/users";
import { MedicinesClient } from "./medicines-client";

export default async function MedicinesPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;
  const res = await getMedicines();
  const medicines = res.success ? (res.data || []) : [];

  return (
    <MedicinesClient
      initialMedicines={medicines}
      isAdmin={user.role === "ADMIN"}
    />
  );
}
