import { notFound } from "next/navigation";
import type { User as DbUser, Store } from "@/db/schema";
import { getStoreDetails } from "@/server/store";
import { StoreDetailsClient } from "./store-details-client";

interface StoreDetailPageProps {
  params: Promise<{
    storeId: string;
  }>;
}

export default async function SuperAdminStoreDetailPage({
  params,
}: StoreDetailPageProps) {
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;

  const res = await getStoreDetails(storeId);

  if (!(res.success && res.data)) {
    notFound();
  }

  const store: Store = res.data;
  const owner: DbUser | null = res.owner || null;

  return <StoreDetailsClient owner={owner} store={store} />;
}
