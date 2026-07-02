'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function SearchBarInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    router.push(`/browse?${params.toString()}`)
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-xs" role="search">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Search EAs, indicators..."
        className="h-9 pl-8"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search files"
      />
    </form>
  )
}

export function SearchBar() {
  return (
    <Suspense fallback={<div className="h-9 w-full max-w-xs" />}>
      <SearchBarInner />
    </Suspense>
  )
}
