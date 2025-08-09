'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SearchPage() {
  const supabase = createClientComponentClient()
  const [q, setQ] = useState('')
  const [topics, setTopics] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const doSearch = async () => {
      const query = q.trim()
      if (!query) { setTopics([]); setPosts([]); return }
      const { data: t } = await supabase.from('topics').select('*').ilike('name', `%${query}%`).limit(10)
      const { data: p } = await supabase.from('posts').select('*').ilike('content', `%${query}%`).limit(20)
      setTopics(t ?? [])
      setPosts(p ?? [])
    }
    const id = setTimeout(doSearch, 250)
    return () => clearTimeout(id)
  }, [q, supabase])

  return (
    <div className="space-y-4">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics and posts" className="w-full border rounded-md px-3 py-2" />
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-semibold mb-2">Topics</h2>
          <div className="grid gap-2">
            {topics.map(t => (
              <a key={t.id} href={`/topics/${t.slug}`} className="card p-3">{t.name}</a>
            ))}
            {topics.length === 0 && <div className="text-sm text-gray-600">No topics.</div>}
          </div>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Posts</h2>
          <div className="grid gap-2">
            {posts.map(p => (
              <div key={p.id} className="card p-3">
                <div className="text-sm text-gray-600">Thread: {p.thread_id}</div>
                <div className="whitespace-pre-wrap">{p.content}</div>
              </div>
            ))}
            {posts.length === 0 && <div className="text-sm text-gray-600">No posts.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}