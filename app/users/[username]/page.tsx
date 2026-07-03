import Link from "next/link"
import { notFound } from "next/navigation"
import { Trophy, Upload, Star, Calendar } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileCard } from "@/components/file-card"
import { RatingStars } from "@/components/rating-stars"
import { getProfileByUsername } from "@/lib/queries"

const roleColors: Record<string, string> = {
  admin: "bg-destructive text-destructive-foreground",
  moderator: "bg-primary text-primary-foreground",
  uploader: "bg-accent text-accent-foreground",
  member: "bg-secondary text-secondary-foreground",
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const data = await getProfileByUsername(decodeURIComponent(username))
  if (!data) notFound()

  const { profile, files, reviews } = data
  const totalDownloads = files.reduce((sum, f) => sum + f.download_count, 0)

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6">
      {/* Profile header */}
      <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
        <Avatar className="size-20">
          <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="text-2xl">{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-card-foreground">{profile.username}</h1>
            <Badge className={roleColors[profile.role] ?? roleColors.member}>{profile.role}</Badge>
          </div>
          {profile.bio && <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Trophy className="size-4 text-primary" />
              {profile.reputation.toLocaleString()} reputation
            </span>
            <span className="flex items-center gap-1.5">
              <Upload className="size-4" />
              {files.length} uploads
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="size-4" />
              {totalDownloads.toLocaleString()} total downloads
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              Joined {format(new Date(profile.created_at), "MMM yyyy")}
            </span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <Tabs defaultValue="uploads">
        <TabsList>
          <TabsTrigger value="uploads">Uploads ({files.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads" className="mt-4">
          {files.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No uploads yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {files.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          {reviews.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No reviews written yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {reviews.map(
                (review: {
                  id: string
                  rating: number
                  title: string | null
                  body: string
                  created_at: string
                  file?: { title: string; slug: string } | null
                }) => (
                  <li key={review.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {review.file ? (
                        <Link
                          href={`/files/${review.file.slug}`}
                          className="text-sm font-semibold text-card-foreground hover:text-primary"
                        >
                          {review.file.title}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">Deleted file</span>
                      )}
                      <RatingStars rating={review.rating} />
                    </div>
                    {review.title && <p className="text-sm font-medium text-card-foreground">{review.title}</p>}
                    {review.body && <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </span>
                  </li>
                ),
              )}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}
