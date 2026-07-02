import { Suspense } from "react"
import { SearchBar } from "@/components/search-bar"
import { FileCard } from "@/components/file-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { searchFiles, getCategories } from "@/lib/queries"

async function Results({ query, category }: { query: string; category?: string }) {
  const [files, categories] = await Promise.all([searchFiles(query, category), getCategories()])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/browse${query ? `?q=${encodeURIComponent(query)}` : ""}`}>
          <Badge variant={!category ? "default" : "secondary"}>All</Badge>
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/browse?category=${cat.slug}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
          >
            <Badge variant={category === cat.slug ? "default" : "secondary"}>{cat.name}</Badge>
          </Link>
        ))}
      </div>

      {files.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No files found{query ? ` for "${query}"` : ""}. Try a different search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  )
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q = "", category } = await searchParams

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground">{q ? `Search: ${q}` : "Browse files"}</h1>
      <div className="max-w-xl">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        }
      >
        <Results query={q} category={category} />
      </Suspense>
    </main>
  )
}
