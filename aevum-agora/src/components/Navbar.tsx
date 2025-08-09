'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Bell, LogIn, LogOut, Search } from 'lucide-react'
import clsx from 'clsx'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="border-b border-parchment-200/80 bg-white/70 backdrop-blur sticky top-0 z-40">
      <div className="container-page h-14 flex items-center gap-4">
        <Link href="/" className="font-display text-xl tracking-wide">
          Aevum Agora
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link className={clsx('hover:underline', pathname === '/topics' && 'font-semibold')} href="/topics">
            Topics
          </Link>
          <Link className={clsx('hover:underline', pathname === '/explore' && 'font-semibold')} href="/explore">
            Explore
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/search" className="btn-outline h-9 px-3 text-sm">
            <Search className="h-4 w-4 mr-2" /> Search
          </Link>
          {user ? (
            <>
              <Link href="/notifications" className="btn-outline h-9 px-3 text-sm" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Link>
              <Link href="/me" className="btn-outline h-9 px-3 text-sm">
                Profile
              </Link>
              <button onClick={handleLogout} className="btn h-9 px-3 text-sm">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn h-9 px-3 text-sm">
              <LogIn className="h-4 w-4 mr-2" /> Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}