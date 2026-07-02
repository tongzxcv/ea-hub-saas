import Link from "next/link"
import { Suspense } from "react"
import { TrendingUp, Clock, Star, Download, Bot, LineChart, Settings2, Wrench } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { FileSection } from "@/components/file-section"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getCategories,
  getTrendingFiles,
  getLatestFiles,
  getTopRatedFiles,
  getMostDownloadedFiles,
} from "@/lib/queries"

const categoryIcons: Record<string, React.ReactNode> = {
  "expert-advisors": <Bot className="size-5" />,
  indicators: <LineChart className="size-5" />,
  presets: <Settings2 className="size-5" />,
  tools: <Wrench className="size-5" />,
}

async function Categories() {
  const categories = await getCategories()
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/browse?category=${cat.slug}`}
          className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-secondary"
        >
          <span className="text-primary">{categoryIcons[cat.slug] ?? <Wrench className="size-5" />}</span>
          <span className="text-sm font-semibold text-card-foreground">{cat.name}</span>
          <span className="line-clamp-2 text-xs text-muted-foreground">{cat.description}</span>
        </Link>
      ))}
    </div>
  )
}

async function HomeSections() {
  const [trending, latest, topRated, mostDownloaded] = await Promise.all([
    getTrendingFiles(8),
    getLatestFiles(8),
    getTopRatedFiles(8),
    getMostDownloadedFiles(8),
  ])

  return (
    <div className="flex flex-col gap-10">
      <FileSection
        title="Trending"
        icon={<TrendingUp className="size-5 text-primary" />}
        files={trending}
        emptyMessage="No trending files yet. Be the first to upload!"
      />
      <FileSection
        title="Latest Uploads"
        icon={<Clock className="size-5 text-primary" />}
        files={latest}
        emptyMessage="No files uploaded yet."
      />
      <FileSection
        title="Top Rated"
        icon={<Star className="size-5 text-primary" />}
        files={topRated}
        emptyMessage="No rated files yet."
      />
      <FileSection
        title="Most Downloaded"
        icon={<Download className="size-5 text-primary" />}
        files={mostDownloaded}
        emptyMessage="No downloads yet."
      />
    </div>
  )
}

function SectionsSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <Skeleton className="h-7 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 md:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card px-6 py-12 text-center md:py-16">
        <h1 className="max-w-2xl text-balance font-sans text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          The community hub for Expert Advisors &amp; trading tools
        </h1>
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          Discover, download, and review EAs, indicators, presets, and tools shared by traders worldwide.
        </p>
        <div className="w-full max-w-xl">
          <Suspense>
            <SearchBar size="lg" />
          </Suspense>
        </div>
      </section>

      {/* Categories */}
      <section className="flex flex-col gap-4" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-lg font-semibold text-foreground">
          Browse by category
        </h2>
        <Suspense fallback={<Skeleton className="h-28 rounded-xl" />}>
          <Categories />
        </Suspense>
      </section>

      {/* File sections */}
      <Suspense fallback={<SectionsSkeleton />}>
        <HomeSections />
      </Suspense>
    </main>
  )
}
