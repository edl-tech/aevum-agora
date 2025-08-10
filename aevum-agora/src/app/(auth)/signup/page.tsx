'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

export default function SignupPage() {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="max-w-md mx-auto card p-8">
      <h1 className="font-display text-2xl">Create account</h1>
      <form onSubmit={signup} className="mt-6 grid gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="w-full border rounded-md px-3 py-2" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border rounded-md px-3 py-2" required />
        <button className="btn" disabled={loading}>Sign up</button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  )
}