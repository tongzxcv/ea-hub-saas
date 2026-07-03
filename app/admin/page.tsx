import { redirect } from "next/navigation"
import { Files, Users, Flag, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminFilesTable } from "@/components/admin/admin-files-table"
import { AdminUsersTable } from "@/components/admin/admin-users-table"
import { AdminReportsTable } from "@/components/admin/admin-reports-table"
import { createClient } from "@/lib/supabase/server"
import type { FileRecord, Profile, Report } from "@/lib/types"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/")

  const [filesResult, usersResult, reportsResult, downloadsResult] = await Promise.all([
    supabase
      .from("files")
      .select("*, uploader:profiles!files_uploader_id_fkey(id, username, avatar_url, role, reputation)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
    supabase
      .from("reports")
      .select("*, reporter:profiles!reports_reporter_id_fkey(id, username), file:files(id, title, slug)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("downloads").select("id", { count: "exact", head: true }),
  ])

  const files = (filesResult.data as FileRecord[]) ?? []
  const users = (usersResult.data as Profile[]) ?? []
  const reports = (reportsResult.data as Report[]) ?? []
  const totalDownloads = downloadsResult.count ?? 0
  const openReports = reports.filter((r) => r.status === "open").length

  const stats = [
    { label: "Total files", value: files.length, icon: <Files className="size-4" /> },
    { label: "Total users", value: users.length, icon: <Users className="size-4" /> },
    { label: "Total downloads", value: totalDownloads, icon: <Download className="size-4" /> },
    { label: "Open reports", value: openReports, icon: <Flag className="size-4" /> },
  ]

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground">Admin panel</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              {stat.icon}
              {stat.label}
            </span>
            <span className="text-2xl font-bold text-card-foreground">{stat.value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Management tabs */}
      <Tabs defaultValue="files">
        <TabsList>
          <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="reports">
            Reports {openReports > 0 ? `(${openReports} open)` : `(${reports.length})`}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="files" className="mt-4">
          <AdminFilesTable files={files} />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <AdminUsersTable users={users} currentUserId={user.id} />
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
          <AdminReportsTable reports={reports} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
