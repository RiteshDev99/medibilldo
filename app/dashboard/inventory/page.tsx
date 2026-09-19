import { AccessDenied } from "@/components/access-denied";
import { getInventoryData } from "@/server/inventory";
import { getCurrentUser } from "@/server/users";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    return <AccessDenied />;
  }

  const res = await getInventoryData();

  const stats = res.stats || {
    totalMedicines: 0,
    totalBatches: 0,
    totalStockUnits: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    expiredBatchesCount: 0,
    totalCostValuation: 0,
    totalMrpValuation: 0,
  };

  const medicines = res.medicines || [];
  const batches = res.batches || [];
  const movements = res.movements || [];

  return (
    <InventoryClient
      stats={stats}
      medicines={medicines}
      batches={batches}
      movements={movements}
      isAdmin={user.role === "ADMIN"}
    />
  );
}
