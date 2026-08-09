import { getCurrentUser } from "@/server/users";
import { Logout } from "./logout";

export async function Header() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  return (
    <header className="absolute top-0 right-0 left-0 z-50 flex items-center justify-between border-border border-b bg-white p-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-black font-extrabold text-sm text-white tracking-tighter">
          mb
        </div>
        <span className="font-extrabold text-lg tracking-tight">
          medibilldo
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex hidden flex-col text-right sm:flex">
          <span className="font-semibold text-sm">{user.name}</span>
          <span className="flex items-center justify-end gap-1.5 text-muted-foreground text-xs">
            {user.email}
            <span className="rounded bg-black px-1.5 py-0.5 font-bold text-[9px] text-white uppercase tracking-wider">
              {user.role}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:hidden">
          <span className="rounded bg-black px-1.5 py-0.5 font-bold text-[9px] text-white uppercase tracking-wider">
            {user.role}
          </span>
        </div>
        <Logout />
      </div>
    </header>
  );
}
