'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signInWithProvider(provider: 'github' | 'google') {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}` } })
    setLoading(false)
    if (error) setError(error.message)
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}` } })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="max-w-md mx-auto card p-8">
      <h1 className="font-display text-2xl">Login</h1>
      <p className="text-sm text-gray-600">Join the conversation.</p>
      <div className="mt-6 grid gap-2">
        <button className="btn" disabled={loading} onClick={() => signInWithProvider('github')}>Continue with GitHub</button>
        <button className="btn" disabled={loading} onClick={() => signInWithProvider('google')}>Continue with Google</button>
      </div>
      <div className="mt-6">
        <form onSubmit={sendMagicLink} className="grid gap-2">
          <label className="text-sm text-gray-700">Or sign in with email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="w-full border rounded-md px-3 py-2" required />
          <button className="btn" disabled={loading}>
            Send magic link
          </button>
        </form>
        {sent && <p className="text-sm text-green-700 mt-2">Check your email for a sign-in link.</p>}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  )
}