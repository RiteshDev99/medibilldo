import { getAllStores } from "@/server/store";
import { StoresClient } from "./stores-client";
import type { Store } from "@/db/schema";

interface StoresPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function SuperAdminStoresPage({ searchParams }: StoresPageProps) {
  const resolvedParams = await searchParams;
  const searchVal = resolvedParams?.search || "";

  const res = await getAllStores(searchVal);
  const stores: Store[] = res.success ? res.data || [] : [];

  return <StoresClient initialStores={stores} />;
}
