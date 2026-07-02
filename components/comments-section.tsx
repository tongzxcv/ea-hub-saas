"use client"

import { useState } from "react"
import { Reply } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { submitComment } from "@/lib/actions"
import type { Comment } from "@/lib/types"

function CommentForm({
  fileId,
  fileSlug,
  parentId,
  onDone,
}: {
  fileId: string
  fileSlug: string
  parentId: string | null
  onDone?: () => void
}) {
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    try {
      const result = await submitComment(fileId, fileSlug, parentId, formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Comment posted")
        onDone?.()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-2">
      <Textarea name="body" placeholder="Write a comment..." rows={2} maxLength={2000} required />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Posting..." : "Post"}
        </Button>
        {onDone && (
          <Button type="button" size="sm" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

function CommentItem({
  comment,
  fileId,
  fileSlug,
  isLoggedIn,
  depth,
}: {
  comment: Comment
  fileId: string
  fileSlug: string
  isLoggedIn: boolean
  depth: number
}) {
  const [replying, setReplying] = useState(false)

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <Avatar className="size-7">
          <AvatarImage src={comment.user?.avatar_url ?? undefined} alt="" />
          <AvatarFallback>{comment.user?.username?.slice(0, 2).toUpperCase() ?? "??"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{comment.user?.username ?? "Unknown"}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{comment.body}</p>
          {isLoggedIn && depth < 2 && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Reply className="size-3" /> Reply
            </button>
          )}
          {replying && (
            <CommentForm fileId={fileId} fileSlug={fileSlug} parentId={comment.id} onDone={() => setReplying(false)} />
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <ul className="ml-8 flex flex-col gap-3 border-l border-border pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              fileId={fileId}
              fileSlug={fileSlug}
              isLoggedIn={isLoggedIn}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function CommentsSection({
  comments,
  fileId,
  fileSlug,
  isLoggedIn,
}: {
  comments: Comment[]
  fileId: string
  fileSlug: string
  isLoggedIn: boolean
}) {
  // Build nested tree
  const map = new Map<string, Comment & { replies: Comment[] }>()
  const roots: (Comment & { replies: Comment[] })[] = []
  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] })
  }
  for (const c of comments) {
    const node = map.get(c.id)!
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoggedIn ? (
        <CommentForm fileId={fileId} fileSlug={fileSlug} parentId={null} />
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to join the discussion.</p>
      )}
      {roots.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {roots.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              fileId={fileId}
              fileSlug={fileSlug}
              isLoggedIn={isLoggedIn}
              depth={0}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
