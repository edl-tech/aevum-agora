'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Post } from '@/lib/types'
import { PostCard } from '@/components/PostCard'

export default function ThreadPage() {
  const params = useParams<{ id: string }>()
  const threadId = params.id
  const supabase = createClientComponentClient()
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
      setPosts(data ?? [])
    }
    load()

    const channel = supabase
      .channel('realtime:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `thread_id=eq.${threadId}` }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setPosts(prev => [...prev, payload.new as Post])
        } else if (payload.eventType === 'UPDATE') {
          setPosts(prev => prev.map(p => (p.id === payload.new.id ? (payload.new as Post) : p)))
        } else if (payload.eventType === 'DELETE') {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, threadId])

  async function submitPost(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() && !imageUrl && !linkUrl) return
    const { data: session } = await supabase.auth.getUser()
    if (!session.user) return
    await supabase.from('posts').insert({ thread_id: threadId, content: content.trim(), image_url: imageUrl || null, link_url: linkUrl || null, author_id: session.user.id })
    setContent('')
    setImageUrl('')
    setLinkUrl('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submitPost} className="card p-4 grid gap-2">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your thoughts… use @username to mention" className="w-full border rounded-md p-3 min-h-[80px]" />
        <div className="grid md:grid-cols-2 gap-2">
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (optional)" className="w-full border rounded-md px-3 py-2" />
          <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Link URL (optional)" className="w-full border rounded-md px-3 py-2" />
        </div>
        <div className="flex justify-end">
          <button className="btn">Post</button>
        </div>
      </form>

      <div className="grid gap-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        {posts.length === 0 && <div className="text-sm text-gray-600">No posts yet. Be the first to share.</div>}
      </div>
    </div>
  )
}