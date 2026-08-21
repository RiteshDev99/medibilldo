import { getStoreDetails } from "@/server/store";
import { StoreDetailsClient } from "./store-details-client";
import { notFound } from "next/navigation";
import type { Store, User as DbUser } from "@/db/schema";

interface StoreDetailPageProps {
  params: Promise<{
    storeId: string;
  }>;
}

export default async function SuperAdminStoreDetailPage({ params }: StoreDetailPageProps) {
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;

  const res = await getStoreDetails(storeId);

  if (!res.success || !res.data) {
    notFound();
  }

  const store: Store = res.data;
  const owner: DbUser | null = res.owner || null;

  return <StoreDetailsClient store={store} owner={owner} />;
}
