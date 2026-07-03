"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { updateUserRole } from "@/lib/admin-actions"
import type { Profile, Role } from "@/lib/types"

const ROLES: Role[] = ["admin", "moderator", "uploader", "member"]

export function AdminUsersTable({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  async function handleRoleChange(userId: string, role: string) {
    const result = await updateUserRole(userId, role)
    if (result?.error) toast.error(result.error)
    else toast.success("Role updated")
  }

  if (users.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No users yet.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Reputation</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Link href={`/users/${user.username}`} className="flex items-center gap-2 hover:text-primary">
                  <Avatar className="size-7">
                    <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                    <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{user.username}</span>
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{user.reputation.toLocaleString()}</TableCell>
              <TableCell className="text-muted-foreground">{format(new Date(user.created_at), "MMM d, yyyy")}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(v) => v && handleRoleChange(user.id, v)}
                  disabled={user.id === currentUserId}
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
