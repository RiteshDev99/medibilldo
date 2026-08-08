import { getCurrentUser } from "@/server/users";
import { AccessDenied } from "@/components/access-denied";

export default async function StaffPage() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  if (user.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="border-b border-zinc-200 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Personnel</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">Staff Management</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage operator profiles, activity streams, and daily shift statistics.</p>
      </div>
      <div className="p-12 text-center border border-dashed border-zinc-200 bg-white rounded-xl">
        <p className="text-sm font-semibold text-zinc-800">This module is under active development.</p>
        <p className="text-xs text-zinc-500 mt-1">Staff shift performance metrics and user permissions management will be available soon.</p>
      </div>
    </div>
  );
}
