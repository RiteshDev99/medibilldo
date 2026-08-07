import { getCurrentUser } from "@/server/users";
import { Logout } from "./logout";

export async function Header() {
  const session = await getCurrentUser();
  const user = session.currentUser;

  return (
    <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b border-border bg-white z-50">
      <div className="flex items-center gap-2">
        <div className="size-8 flex items-center justify-center rounded-lg bg-black text-white font-extrabold text-sm tracking-tighter">
          mb
        </div>
        <span className="font-extrabold text-lg tracking-tight">medibilldo</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col text-right hidden sm:flex">
          <span className="text-sm font-semibold">{user.name}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 justify-end">
            {user.email}
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-black text-white rounded">
              {user.role}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:hidden">
          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-black text-white rounded">
            {user.role}
          </span>
        </div>
        <Logout />
      </div>
    </header>
  );
}

