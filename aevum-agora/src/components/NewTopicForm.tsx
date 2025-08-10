'use client'

import { useState, useTransition } from 'react'
import { createTopic } from '@/app/actions'
import { useRouter } from 'next/navigation'

export function NewTopicForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.append('name', name)
    fd.append('description', description)
    const res = await createTopic(fd)
    if ('error' in res && res.error) {
      setError(res.error)
    } else if ('slug' in res && res.slug) {
      startTransition(() => router.push(`/topics/${res.slug}`))
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label className="text-sm">Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
      <label className="text-sm">Description</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-md p-3 min-h-[120px]" />
      <div className="flex items-center gap-3">
        <button className="btn" disabled={pending}>Create topic</button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  )
}