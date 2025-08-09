export type Role = 'member' | 'moderator' | 'admin'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  role: Role
  created_at: string
}

export interface Topic {
  id: string
  slug: string
  name: string
  description: string | null
  created_by: string
  created_at: string
}

export interface Thread {
  id: string
  topic_id: string
  title: string
  author_id: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  thread_id: string
  author_id: string
  content: string
  image_url: string | null
  link_url: string | null
  created_at: string
  updated_at: string
  like_count?: number
  comment_count?: number
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_comment_id: string | null
  content: string
  created_at: string
}

export type NotificationType = 'reply' | 'mention' | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  payload: Record<string, unknown>
  read_at: string | null
  created_at: string
}