'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function SearchBarInner({ size = 'default' }: { size?: 'default' | 'lg' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    router.push(`/browse?${params.toString()}`)
  }

  const isLg = size === 'lg'

  return (
    <form
      onSubmit={submit}
      className={isLg ? 'relative w-full' : 'relative w-full max-w-xs'}
      role="search"
    >
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Search EAs, indicators..."
        className={isLg ? 'h-11 pl-8 text-base' : 'h-9 pl-8'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search files"
      />
    </form>
  )
}

export function SearchBar({ size = 'default' }: { size?: 'default' | 'lg' }) {
  return (
    <Suspense
      fallback={
        <div className={size === 'lg' ? 'h-11 w-full' : 'h-9 w-full max-w-xs'} />
      }
    >
      <SearchBarInner size={size} />
    </Suspense>
  )
}
