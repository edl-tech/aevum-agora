import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function getBrowserSupabaseClient() {
  return createClientComponentClient()
}

export function getServerSupabaseClient() {
  return createServerComponentClient({ cookies })
}