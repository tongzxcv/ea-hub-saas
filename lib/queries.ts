import { createClient } from '@/lib/supabase/server'
import type { Category, FileRecord, Profile } from '@/lib/types'

const FILE_SELECT = `
  *,
  uploader:profiles!files_uploader_id_fkey(id, username, avatar_url, role, reputation),
  category:categories(id, name, slug)
`

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').order('name')
  return (data as Category[]) ?? []
}

export async function getTrendingFiles(limit = 8): Promise<FileRecord[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('files')
    .select(FILE_SELECT)
    .order('view_count', { ascending: false })
    .limit(limit)
  return (data as FileRecord[]) ?? []
}

export async function getLatestFiles(limit = 8): Promise<FileRecord[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('files')
    .select(FILE_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as FileRecord[]) ?? []
}

export async function getTopRatedFiles(limit = 8): Promise<FileRecord[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('files')
    .select(FILE_SELECT)
    .gt('rating_count', 0)
    .order('avg_rating', { ascending: false })
    .order('rating_count', { ascending: false })
    .limit(limit)
  return (data as FileRecord[]) ?? []
}

export async function getMostDownloadedFiles(
  limit = 8,
): Promise<FileRecord[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('files')
    .select(FILE_SELECT)
    .order('download_count', { ascending: false })
    .limit(limit)
  return (data as FileRecord[]) ?? []
}

export async function searchFiles(
  query: string,
  categorySlug?: string,
): Promise<FileRecord[]> {
  const supabase = await createClient()
  let q = supabase.from('files').select(FILE_SELECT)
  if (query) {
    q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  }
  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    if (cat) q = q.eq('category_id', cat.id)
  }
  const { data } = await q
    .order('download_count', { ascending: false })
    .limit(40)
  return (data as FileRecord[]) ?? []
}

export async function getFileBySlug(slug: string) {
  const supabase = await createClient()
  const { data: file } = await supabase
    .from('files')
    .select(FILE_SELECT)
    .eq('slug', slug)
    .single()

  if (!file) return null

  const [versions, screenshots, reviews, comments, tags] = await Promise.all([
    supabase
      .from('file_versions')
      .select('*')
      .eq('file_id', file.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('file_screenshots')
      .select('*')
      .eq('file_id', file.id)
      .order('sort_order'),
    supabase
      .from('reviews')
      .select('*, user:profiles(id, username, avatar_url, role, reputation)')
      .eq('file_id', file.id)
      .order('helpful_count', { ascending: false }),
    supabase
      .from('comments')
      .select('*, user:profiles(id, username, avatar_url, role, reputation)')
      .eq('file_id', file.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('file_tags')
      .select('tag:tags(id, name, slug)')
      .eq('file_id', file.id),
  ])

  return {
    file: file as FileRecord,
    versions: versions.data ?? [],
    screenshots: screenshots.data ?? [],
    reviews: reviews.data ?? [],
    comments: comments.data ?? [],
    tags: (tags.data ?? []).map((t) => t.tag).filter(Boolean),
  }
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) return null

  const [files, reviews] = await Promise.all([
    supabase
      .from('files')
      .select(FILE_SELECT)
      .eq('uploader_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('*, file:files(id, title, slug)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return {
    profile: profile as Profile,
    files: (files.data as FileRecord[]) ?? [],
    reviews: reviews.data ?? [],
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return (data as Profile) ?? null
}
