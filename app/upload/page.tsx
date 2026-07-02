import { redirect } from "next/navigation"
import { UploadForm } from "@/components/upload-form"
import { getCategories } from "@/lib/queries"
import { createClient } from "@/lib/supabase/server"
import type { Tag } from "@/lib/types"

export default async function UploadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [categories, tagsResult] = await Promise.all([
    getCategories(),
    supabase.from("tags").select("*").order("name"),
  ])
  const tags = (tagsResult.data as Tag[]) ?? []

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Upload a file</h1>
        <p className="text-sm text-muted-foreground">
          Share your Expert Advisor, indicator, preset, or tool with the community.
        </p>
      </div>
      <UploadForm categories={categories} tags={tags} userId={user.id} />
    </main>
  )
}
