'use server'

import { z } from 'zod'
import { getServerSupabaseClient } from '@/lib/supabaseClient'

const createTopicSchema = z.object({ name: z.string().min(3).max(80), description: z.string().max(500).optional() })

export async function createTopic(formData: FormData) {
  const parsed = createTopicSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description')
  })
  if (!parsed.success) return { error: 'Invalid input' }
  const supabase = getServerSupabaseClient()
  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) return { error: 'Not authenticated' }
  const { error } = await supabase.from('topics').insert({ slug, name: parsed.data.name, description: parsed.data.description ?? null, created_by: session.user.id })
  if (error) return { error: error.message }
  return { ok: true, slug }
}

const createThreadSchema = z.object({ topic_id: z.string().uuid(), title: z.string().min(3).max(160) })
export async function createThread(input: z.infer<typeof createThreadSchema>) {
  const parsed = createThreadSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid input' }
  const supabase = getServerSupabaseClient()
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) return { error: 'Not authenticated' }
  const { data, error } = await supabase.from('threads').insert({
    topic_id: parsed.data.topic_id,
    title: parsed.data.title,
    author_id: session.user.id
  }).select('id').single()
  if (error) return { error: error.message }
  return { ok: true, id: data?.id }
}

const createPostSchema = z.object({ thread_id: z.string().uuid(), content: z.string().max(4000), image_url: z.string().url().optional().nullable(), link_url: z.string().url().optional().nullable() })
export async function createPost(input: z.infer<typeof createPostSchema>) {
  const parsed = createPostSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid input' }
  const supabase = getServerSupabaseClient()
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) return { error: 'Not authenticated' }
  const { data, error } = await supabase.from('posts').insert({
    thread_id: parsed.data.thread_id,
    content: parsed.data.content,
    image_url: parsed.data.image_url ?? null,
    link_url: parsed.data.link_url ?? null,
    author_id: session.user.id
  }).select('id, content').single()
  if (error) return { error: error.message }
  await createMentionNotifications(parsed.data.content, session.user.id)
  return { ok: true, id: data?.id }
}

const createCommentSchema = z.object({ post_id: z.string().uuid(), content: z.string().min(1).max(2000), parent_comment_id: z.string().uuid().optional() })
export async function createComment(input: z.infer<typeof createCommentSchema>) {
  const parsed = createCommentSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid input' }
  const supabase = getServerSupabaseClient()
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) return { error: 'Not authenticated' }
  const { data, error } = await supabase.from('comments').insert({
    post_id: parsed.data.post_id,
    content: parsed.data.content,
    parent_comment_id: parsed.data.parent_comment_id ?? null,
    author_id: session.user.id
  }).select('id, content').single()
  if (error) return { error: error.message }
  await createMentionNotifications(parsed.data.content, session.user.id)
  return { ok: true, id: data?.id }
}

const likeSchema = z.object({ post_id: z.string().uuid() })
export async function likePost(input: z.infer<typeof likeSchema>) {
  const supabase = getServerSupabaseClient()
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) return { error: 'Not authenticated' }
  const { error } = await supabase.from('post_likes').insert({ post_id: input.post_id, user_id: session.user.id })
  if (error) return { error: error.message }
  return { ok: true }
}

export async function unlikePost(input: z.infer<typeof likeSchema>) {
  const supabase = getServerSupabaseClient()
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) return { error: 'Not authenticated' }
  const { error } = await supabase.from('post_likes').delete().match({ post_id: input.post_id, user_id: session.user.id })
  if (error) return { error: error.message }
  return { ok: true }
}

async function createMentionNotifications(text: string, authorId: string) {
  const supabase = getServerSupabaseClient()
  const mentions = Array.from(new Set((text.match(/@([a-zA-Z0-9_]{3,20})/g) ?? []).map((m: string) => m.slice(1))))
  if (mentions.length === 0) return
  const { data: users } = await supabase.from('profiles').select('id, username').in('username', mentions)
  const rows = (users ?? []).filter((u: { id: string; username: string }) => u.id !== authorId).map((u: { id: string; username: string }) => ({ user_id: u.id, type: 'mention', payload: { username: u.username, text } }))
  if (rows.length) {
    await supabase.from('notifications').insert(rows)
  }
}