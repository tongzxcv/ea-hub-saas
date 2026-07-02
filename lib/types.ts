export type Role = 'admin' | 'moderator' | 'uploader' | 'member'

export type FileStatus =
  | 'verified'
  | 'testing'
  | 'stable'
  | 'experimental'
  | 'deprecated'
  | 'archived'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  role: Role
  reputation: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface FileRecord {
  id: string
  uploader_id: string
  category_id: string
  title: string
  slug: string
  description: string
  cover_image_url: string | null
  status: FileStatus
  download_count: number
  view_count: number
  like_count: number
  avg_rating: number
  rating_count: number
  created_at: string
  updated_at: string
  // joined
  uploader?: Profile
  category?: Category
  tags?: Tag[]
}

export interface FileVersion {
  id: string
  file_id: string
  version: string
  changelog: string
  storage_path: string | null
  file_size_bytes: number | null
  download_count: number
  created_at: string
}

export interface Screenshot {
  id: string
  file_id: string
  image_url: string
  sort_order: number
}

export interface Review {
  id: string
  file_id: string
  user_id: string
  rating: number
  title: string | null
  body: string
  helpful_count: number
  created_at: string
  user?: Profile
}

export interface Comment {
  id: string
  file_id: string
  user_id: string
  parent_id: string | null
  body: string
  created_at: string
  user?: Profile
  replies?: Comment[]
}

export interface Report {
  id: string
  reporter_id: string
  file_id: string | null
  comment_id: string | null
  review_id: string | null
  reason: string
  details: string | null
  status: 'open' | 'resolved' | 'dismissed'
  created_at: string
  reporter?: Profile
  file?: Pick<FileRecord, 'id' | 'title' | 'slug'>
}
