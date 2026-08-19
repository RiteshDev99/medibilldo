import { AccessDenied } from "@/components/access-denied";
import { getCurrentUser } from "@/server/users";
import { getCurrentStore } from "@/server/store";
import { StoreProfile } from "@/components/store-profile";

export default async function SettingsPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  if (user.role !== "ADMIN") {
    return <AccessDenied />;
  }

  const store = await getCurrentStore();

  return (
    <div className="space-y-8 p-6 md:p-10">
      <div className="border-zinc-200 border-b pb-6">
        <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
          System Preferences
        </span>
        <h1 className="mt-1 font-extrabold text-3xl text-zinc-900 tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-550">
          Manage your medical store details, licensing information, and billing preferences.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-bold text-lg text-zinc-900 tracking-tight">
          Store Profile
        </h2>
        {store ? (
          <StoreProfile store={store} />
        ) : (
          <div className="rounded-xl border border-zinc-200 border-dashed bg-white p-12 text-center">
            <p className="font-semibold text-sm text-zinc-800">
              No store profile found.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Please configure your store by returning to the dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
