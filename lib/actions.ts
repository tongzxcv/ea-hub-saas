'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60) +
    '-' +
    Math.random().toString(36).slice(2, 6)
  )
}

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return { supabase, user }
}

// ===== File upload =====
export async function createFile(formData: FormData) {
  const { supabase, user } = await requireUser()

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const categoryId = String(formData.get('category_id') ?? '')
  const version = String(formData.get('version') ?? '1.0.0').trim()
  const changelog = String(formData.get('changelog') ?? '').trim()
  const storagePath = String(formData.get('storage_path') ?? '')
  const fileSize = Number(formData.get('file_size_bytes') ?? 0)
  const tagIds = formData.getAll('tag_ids').map(String).filter(Boolean)
  const screenshotUrls = formData
    .getAll('screenshot_urls')
    .map(String)
    .filter(Boolean)

  if (!title || !categoryId || !storagePath) {
    return { error: 'Title, category, and file are required.' }
  }

  const slug = slugify(title)

  const { data: file, error } = await supabase
    .from('files')
    .insert({
      uploader_id: user.id,
      category_id: categoryId,
      title,
      slug,
      description,
    })
    .select('id, slug')
    .single()

  if (error || !file) return { error: error?.message ?? 'Failed to create file.' }

  const { error: versionError } = await supabase.from('file_versions').insert({
    file_id: file.id,
    version,
    changelog,
    storage_path: storagePath,
    file_size_bytes: fileSize || null,
  })
  if (versionError) return { error: versionError.message }

  if (tagIds.length > 0) {
    await supabase
      .from('file_tags')
      .insert(tagIds.map((tag_id) => ({ file_id: file.id, tag_id })))
  }

  if (screenshotUrls.length > 0) {
    await supabase.from('file_screenshots').insert(
      screenshotUrls.map((image_url, i) => ({
        file_id: file.id,
        image_url,
        sort_order: i,
      })),
    )
  }

  revalidatePath('/')
  return { slug: file.slug }
}

// ===== New version =====
export async function addVersion(fileId: string, fileSlug: string, formData: FormData) {
  const { supabase } = await requireUser()

  const version = String(formData.get('version') ?? '').trim()
  const changelog = String(formData.get('changelog') ?? '').trim()
  const storagePath = String(formData.get('storage_path') ?? '')
  const fileSize = Number(formData.get('file_size_bytes') ?? 0)

  if (!version || !storagePath) return { error: 'Version and file are required.' }

  const { error } = await supabase.from('file_versions').insert({
    file_id: fileId,
    version,
    changelog,
    storage_path: storagePath,
    file_size_bytes: fileSize || null,
  })
  if (error) return { error: error.message }

  await supabase
    .from('files')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', fileId)

  revalidatePath(`/files/${fileSlug}`)
  return { success: true }
}

// ===== Download =====
export async function recordDownload(fileId: string, versionId: string, storagePath: string) {
  const { supabase, user } = await requireUser()

  await supabase.from('downloads').insert({
    file_id: fileId,
    version_id: versionId,
    user_id: user.id,
  })

  const { data } = await supabase.storage
    .from('files')
    .createSignedUrl(storagePath, 300)

  if (!data?.signedUrl) return { error: 'Could not generate download link.' }
  return { url: data.signedUrl }
}

// ===== Reviews =====
export async function submitReview(fileId: string, fileSlug: string, formData: FormData) {
  const { supabase, user } = await requireUser()

  const rating = Number(formData.get('rating'))
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()

  if (!rating || rating < 1 || rating > 5) return { error: 'Rating is required.' }

  const { error } = await supabase.from('reviews').upsert(
    { file_id: fileId, user_id: user.id, rating, title: title || null, body },
    { onConflict: 'file_id,user_id' },
  )
  if (error) return { error: error.message }

  revalidatePath(`/files/${fileSlug}`)
  return { success: true }
}

export async function toggleReviewLike(reviewId: string, fileSlug: string) {
  const { supabase, user } = await requireUser()

  const { data: existing } = await supabase
    .from('review_likes')
    .select('review_id')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('review_likes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
  } else {
    await supabase
      .from('review_likes')
      .insert({ review_id: reviewId, user_id: user.id })
  }

  revalidatePath(`/files/${fileSlug}`)
}

// ===== Comments =====
export async function submitComment(
  fileId: string,
  fileSlug: string,
  parentId: string | null,
  formData: FormData,
) {
  const { supabase, user } = await requireUser()

  const body = String(formData.get('body') ?? '').trim()
  if (!body) return { error: 'Comment cannot be empty.' }

  const { error } = await supabase.from('comments').insert({
    file_id: fileId,
    user_id: user.id,
    parent_id: parentId,
    body,
  })
  if (error) return { error: error.message }

  revalidatePath(`/files/${fileSlug}`)
  return { success: true }
}

// ===== Reports =====
export async function submitReport(formData: FormData) {
  const { supabase, user } = await requireUser()

  const fileId = String(formData.get('file_id') ?? '') || null
  const reason = String(formData.get('reason') ?? '').trim()
  const details = String(formData.get('details') ?? '').trim()

  if (!reason) return { error: 'Reason is required.' }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    file_id: fileId,
    reason,
    details: details || null,
  })
  if (error) return { error: error.message }
  return { success: true }
}

// ===== View count =====
export async function incrementViewCount(fileId: string) {
  const supabase = await createClient()
  await supabase.rpc('increment_view_count', { target_file_id: fileId })
}
