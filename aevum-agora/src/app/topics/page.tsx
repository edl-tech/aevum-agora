'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Topic } from '@/lib/types'

export default function TopicsPage() {
  const supabase = createClientComponentClient()
  const [topics, setTopics] = useState<Topic[]>([])
  const [q, setQ] = useState('')

  useEffect(() => {
    supabase.from('topics').select('*').order('name', { ascending: true }).then(({ data }) => setTopics(data ?? []))
  }, [supabase])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return topics
    return topics.filter(t => t.name.toLowerCase().includes(query) || (t.description ?? '').toLowerCase().includes(query))
  }, [q, topics])

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics" className="w-full md:w-80 border rounded-md px-3 py-2" />
        <Link href="/topics/new" className="btn">New Topic</Link>
      </div>
      <div className="grid gap-3">
        {filtered.map(t => (
          <Link key={t.id} href={`/topics/${t.slug}`} className="card p-5 hover:shadow-lg transition-shadow">
            <div className="font-semibold">{t.name}</div>
            {t.description && <div className="text-sm text-gray-600">{t.description}</div>}
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-gray-600">No topics found.</div>
        )}
      </div>
    </div>
  )
}