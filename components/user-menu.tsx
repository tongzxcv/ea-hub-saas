'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { LogOut, Shield, Upload, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function UserMenu({ profile }: { profile: Profile }) {
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Open user menu"
          />
        }
      >
        <Avatar className="size-8">
          <AvatarImage
            src={profile.avatar_url ?? undefined}
            alt={profile.username}
          />
          <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
            {profile.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{profile.username}</span>
            <span className="text-xs font-normal capitalize text-muted-foreground">
              {profile.role} · {profile.reputation} rep
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/users/${profile.username}`)}>
          <User className="size-4" aria-hidden="true" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/upload')}>
          <Upload className="size-4" aria-hidden="true" />
          Upload file
        </DropdownMenuItem>
        {profile.role === 'admin' && (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <Shield className="size-4" aria-hidden="true" />
            Admin panel
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
