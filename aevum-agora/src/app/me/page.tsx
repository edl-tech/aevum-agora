'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Profile } from '@/lib/types'

export default function MePage() {
  const supabase = createClientComponentClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getUser()
      if (!session.user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      if (data) {
        setProfile(data as Profile)
        setUsername(data.username ?? '')
        setDisplayName(data.display_name ?? '')
      }
    }
    load()
  }, [supabase])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const { data: session } = await supabase.auth.getUser()
    if (!session.user) return
    await supabase.from('profiles').upsert({ id: session.user.id, username, display_name: displayName })
  }

  if (!profile) {
    return <div className="text-sm text-gray-600">Sign in to manage your profile.</div>
  }

  return (
    <div className="max-w-md card p-6">
      <h1 className="font-display text-2xl">Your profile</h1>
      <form onSubmit={save} className="mt-4 grid gap-3">
        <label className="text-sm">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded-md px-3 py-2" />
        <label className="text-sm">Display name</label>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full border rounded-md px-3 py-2" />
        <button className="btn mt-2">Save</button>
      </form>
    </div>
  )
}