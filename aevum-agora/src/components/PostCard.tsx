"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Post } from '@/lib/types'

export function PostCard({ post }: { post: Post }) {
  const supabase = createClientComponentClient()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState<number>(post.like_count ?? 0)

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getUser()
      if (!session.user) return
      const { data } = await supabase.from('post_likes').select('post_id').eq('post_id', post.id).eq('user_id', session.user.id).maybeSingle()
      setLiked(!!data)
      const { count } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id)
      setLikeCount(count ?? 0)
    }
    load()
  }, [supabase, post.id])

  async function toggleLike() {
    const { data: session } = await supabase.auth.getUser()
    if (!session.user) return
    if (liked) {
      await supabase.from('post_likes').delete().match({ post_id: post.id, user_id: session.user.id })
      setLiked(false)
      setLikeCount((c) => Math.max(0, c - 1))
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: session.user.id })
      setLiked(true)
      setLikeCount((c) => c + 1)
    }
  }

  return (
    <article className="card p-5 space-y-2">
      {post.content && <p className="whitespace-pre-wrap">{post.content}</p>}
      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image_url} alt="post image" className="rounded-lg border" />
      )}
      {post.link_url && (
        <a href={post.link_url} className="text-parchment-700 underline break-all" target="_blank" rel="noreferrer">
          {post.link_url}
        </a>
      )}
      <div className="flex items-center gap-3 pt-2">
        <button className="btn-outline h-8 px-3 text-sm" onClick={toggleLike}>
          {liked ? 'Unlike' : 'Like'} • {likeCount}
        </button>
      </div>
    </article>
  )
}