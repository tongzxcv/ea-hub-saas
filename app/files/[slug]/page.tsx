import Link from "next/link"
import { notFound } from "next/navigation"
import { Download, Eye, Heart, Calendar, FileText } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { RatingStars } from "@/components/rating-stars"
import { StatusBadge } from "@/components/status-badge"
import { DownloadButton } from "@/components/download-button"
import { ReviewForm } from "@/components/review-form"
import { ReviewList } from "@/components/review-list"
import { CommentsSection } from "@/components/comments-section"
import { ReportDialog } from "@/components/report-dialog"
import { ScreenshotGallery } from "@/components/screenshot-gallery"
import { getFileBySlug } from "@/lib/queries"
import { incrementViewCount } from "@/lib/actions"
import { createClient } from "@/lib/supabase/server"
import type { Review, Comment, FileVersion, Screenshot, Tag } from "@/lib/types"

function formatBytes(bytes: number | null) {
  if (!bytes) return null
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function FileDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getFileBySlug(slug)
  if (!data) notFound()

  const { file, versions, screenshots, reviews, comments, tags } = data
  const latestVersion = versions[0] as FileVersion | undefined

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fire and forget view count
  incrementViewCount(file.id)

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {file.category && (
              <Link href={`/browse?category=${file.category.slug}`}>
                <Badge variant="secondary">{file.category.name}</Badge>
              </Link>
            )}
            <StatusBadge status={file.status} />
          </div>
          <h1 className="text-balance text-2xl font-bold text-foreground md:text-3xl">{file.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <RatingStars rating={Number(file.avg_rating)} />
              <span>
                {Number(file.avg_rating).toFixed(1)} ({file.rating_count})
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Download className="size-4" /> {file.download_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-4" /> {file.view_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="size-4" /> {file.like_count.toLocaleString()}
            </span>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(tags as unknown as Tag[]).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          {user && latestVersion ? (
            <DownloadButton
              fileId={file.id}
              versionId={latestVersion.id}
              storagePath={latestVersion.storage_path}
              label={`Download v${latestVersion.version}`}
            />
          ) : !user ? (
            <Link
              href="/auth/login"
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign in to download
            </Link>
          ) : null}
          {latestVersion?.file_size_bytes ? (
            <span className="text-xs text-muted-foreground">{formatBytes(latestVersion.file_size_bytes)}</span>
          ) : null}
          <ReportDialog fileId={file.id} />
        </div>
      </div>

      {/* Uploader */}
      {file.uploader && (
        <Link
          href={`/users/${file.uploader.username}`}
          className="flex w-fit items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary"
        >
          <Avatar className="size-9">
            <AvatarImage src={file.uploader.avatar_url ?? undefined} alt="" />
            <AvatarFallback>{file.uploader.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-card-foreground">{file.uploader.username}</span>
            <span className="text-xs text-muted-foreground">Reputation: {file.uploader.reputation}</span>
          </div>
        </Link>
      )}

      <ScreenshotGallery screenshots={screenshots as Screenshot[]} title={file.title} />

      {/* Tabs */}
      <Tabs defaultValue="description">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-6">
            {file.description ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">{file.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No description provided.</p>
            )}
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                Published {format(new Date(file.created_at), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                Updated {formatDistanceToNow(new Date(file.updated_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <ul className="flex flex-col gap-3">
            {(versions as FileVersion[]).map((version, i) => (
              <li key={version.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <span className="font-semibold text-card-foreground">v{version.version}</span>
                    {i === 0 && <Badge className="text-xs">Latest</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(version.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {version.download_count.toLocaleString()} downloads
                      {version.file_size_bytes ? ` · ${formatBytes(version.file_size_bytes)}` : ""}
                    </span>
                    {user && version.storage_path && (
                      <DownloadButton
                        fileId={file.id}
                        versionId={version.id}
                        storagePath={version.storage_path}
                        size="sm"
                        label="Get"
                      />
                    )}
                  </div>
                </div>
                {version.changelog && (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {version.changelog}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <div className="flex flex-col gap-4">
            {user && <ReviewForm fileId={file.id} fileSlug={file.slug} />}
            <ReviewList reviews={reviews as Review[]} fileSlug={file.slug} isLoggedIn={!!user} />
          </div>
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <CommentsSection
            comments={comments as Comment[]}
            fileId={file.id}
            fileSlug={file.slug}
            isLoggedIn={!!user}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
