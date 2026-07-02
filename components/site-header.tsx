import Link from 'next/link'
import { TrendingUp, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search-bar'
import { UserMenu } from '@/components/user-menu'
import { getCurrentProfile } from '@/lib/queries'

export async function SiteHeader() {
  const profile = await getCurrentProfile()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="EA Hub home"
        >
          <TrendingUp className="size-5 text-primary" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight">EA Hub</span>
        </Link>

        <nav
          className="hidden items-center gap-1 text-sm md:flex"
          aria-label="Main navigation"
        >
          <Link
            href="/browse"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Browse
          </Link>
          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end gap-2 md:max-w-md">
          <SearchBar />
          {profile ? (
            <>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/upload">
                  <Upload className="size-4" aria-hidden="true" />
                  Upload
                </Link>
              </Button>
              <UserMenu profile={profile} />
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
