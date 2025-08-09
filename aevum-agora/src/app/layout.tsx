import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Aevum Agora',
  description: 'A modern forum for architectural discourse',
  metadataBase: new URL(siteUrl)
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="container-page py-6">{children}</main>
      </body>
    </html>
  )
}