'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Notification } from '@/lib/types'

export default function NotificationsPage() {
  const supabase = createClientComponentClient()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getUser()
      if (!session.user) return
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
      setNotifications(data ?? [])

      const channel = supabase
        .channel('realtime:notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` }, (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
    const cleanup = load()
    return () => { cleanup?.then(fn => fn && fn()) }
  }, [supabase])

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl">Notifications</h1>
      {notifications.length === 0 && <div className="text-sm text-gray-600">All caught up.</div>}
      <div className="grid gap-3">
        {notifications.map(n => (
          <div key={n.id} className="card p-4">
            <div className="text-sm text-gray-700">{n.type.toUpperCase()}</div>
            <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(n.payload, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}