'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Thread } from '@/lib/types'

export default function TopicDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [topicId, setTopicId] = useState<string | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    async function load() {
      const { data: topic } = await supabase.from('topics').select('id').eq('slug', slug).single()
      if (topic?.id) {
        setTopicId(topic.id)
        const { data } = await supabase.from('threads').select('*').eq('topic_id', topic.id).order('created_at', { ascending: false })
        setThreads(data ?? [])
      }
    }
    load()
  }, [slug, supabase])

  async function createThread(e: React.FormEvent) {
    e.preventDefault()
    if (!topicId || !title.trim()) return
    const { data: session } = await supabase.auth.getUser()
    if (!session.user) return
    const { data, error } = await supabase.from('threads').insert({ topic_id: topicId, title, author_id: session.user.id }).select('id').single()
    if (!error && data?.id) {
      router.push(`/threads/${data.id}`)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={createThread} className="card p-4 flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Start a new thread" className="flex-1 border rounded-md px-3 py-2" />
        <button className="btn" disabled={!title.trim()}>Create</button>
      </form>
      <div className="grid gap-3">
        {threads.map(t => (
          <a key={t.id} href={`/threads/${t.id}`} className="card p-5 hover:shadow-lg transition-shadow">
            <div className="font-semibold">{t.title}</div>
          </a>
        ))}
        {threads.length === 0 && <div className="text-sm text-gray-600">No threads yet.</div>}
      </div>
    </div>
  )
}