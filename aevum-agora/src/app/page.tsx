import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="card p-8">
        <h1 className="font-display text-3xl">Welcome to Aevum Agora</h1>
        <p className="mt-2 text-gray-600">
          A community space for architects and enthusiasts to discuss principles, share designs, and explore classical ideas in a modern context.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/topics" className="btn">
            Browse Topics
          </Link>
          <Link href="/login" className="btn-outline">
            Join the Community
          </Link>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-6">
          <h2 className="font-semibold">Latest Threads</h2>
          <p className="text-sm text-gray-600">Real-time discussions across topics.</p>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold">Featured Works</h2>
          <p className="text-sm text-gray-600">Curated links and images from the community.</p>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold">Guidelines</h2>
          <p className="text-sm text-gray-600">Respectful discourse and timeless principles.</p>
        </div>
      </section>
    </div>
  )
}