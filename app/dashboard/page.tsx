import { getCurrentUser, getAllUsers } from "@/server/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Dashboard() {
  const session = await getCurrentUser();
  const user = session.currentUser;
  const isAdmin = user.role === "ADMIN";

  const allUsers = isAdmin ? await getAllUsers() : [];

  return (
    <div className="pt-24 min-h-screen bg-zinc-50/50 px-4 md:px-8 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-1 border-b border-zinc-200 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">medibilldo Workspace</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">Welcome, {user.name}</h1>
          <p className="text-sm text-muted-foreground">
            You are logged in as <span className="font-bold text-zinc-900 uppercase">{user.role}</span>.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Details Card */}
          <Card className="md:col-span-1 bg-white border-zinc-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <CardTitle className="text-sm font-bold text-zinc-900">Profile Information</CardTitle>
              <CardDescription>Your account credentials and role level.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name</span>
                <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</span>
                <p className="text-sm font-semibold text-zinc-900">{user.email}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role Level</span>
                <div className="mt-1">
                  <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-black text-white rounded">
                    {user.role}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role specific dashboard area */}
          <Card className="md:col-span-2 bg-white border-zinc-200 shadow-xs overflow-hidden">
            {isAdmin ? (
              <>
                <CardHeader className="pb-3 border-b border-zinc-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-zinc-900">System Users</CardTitle>
                    <CardDescription>Manage and view all registered users in medibilldo.</CardDescription>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-zinc-100 text-zinc-900 rounded-full border border-zinc-200">
                    {allUsers.length} Users
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600">
                      <thead className="bg-zinc-50/50 text-[10px] font-bold uppercase tracking-wider text-zinc-600 border-b border-zinc-100">
                        <tr>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Role</th>
                          <th className="px-6 py-3">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {allUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-zinc-50/30 transition-colors">
                            <td className="px-6 py-4 font-semibold text-zinc-900">{u.name}</td>
                            <td className="px-6 py-4">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                                u.role === "ADMIN" ? "bg-black text-white" : "bg-zinc-100 text-zinc-800"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-zinc-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="pb-3 border-b border-zinc-100">
                  <CardTitle className="text-sm font-bold text-zinc-900">Staff Access Terminal</CardTitle>
                  <CardDescription>Your operational dashboard and workspace resources.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="rounded-lg border border-zinc-200 p-4 bg-zinc-50/50">
                    <h3 className="font-bold text-xs text-zinc-900 uppercase tracking-wider mb-1">Operational Environment</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      As a member of the STAFF, you have access to general billing processing, invoice submission, and reporting tools. Certain administrative functions (e.g. system management, user listings, database logs) require elevated ADMIN privileges.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border border-zinc-200 rounded-lg p-4 flex flex-col justify-between hover:bg-zinc-50/20 transition-all cursor-pointer">
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900 uppercase tracking-wider mb-1">Billing Queue</h4>
                        <p className="text-xs text-zinc-500">Process incoming claims and invoice logs.</p>
                      </div>
                      <span className="mt-4 text-xs font-semibold text-zinc-950 inline-flex items-center gap-1">
                        Queue Active →
                      </span>
                    </div>

                    <div className="border border-zinc-200 rounded-lg p-4 flex flex-col justify-between hover:bg-zinc-50/20 transition-all cursor-pointer">
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900 uppercase tracking-wider mb-1">Submit Invoice</h4>
                        <p className="text-xs text-zinc-500">Draft and submit patient insurance files.</p>
                      </div>
                      <span className="mt-4 text-xs font-semibold text-zinc-950 inline-flex items-center gap-1">
                        Open Terminal →
                      </span>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

