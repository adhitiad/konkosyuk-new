import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, User as UserIcon } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

export default function BetterAuthHeader() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="h-9 w-32 animate-pulse rounded-full bg-[var(--chip-bg)]" />
    )
  }

  if (session?.user) {
    const name = session.user.name || 'Pengguna'
    const email = session.user.email
    const initials = name
      .split(/\s+/)
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full p-0 hover:bg-transparent"
            aria-label="Menu akun"
          >
            <Avatar className="h-9 w-9 border border-[var(--chip-line)] bg-gradient-to-br from-[var(--lagoon)] to-[var(--palm)] text-white">
              {session.user.image ? (
                <AvatarImage src={session.user.image} alt={name} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-[var(--lagoon)] to-[var(--palm)] text-sm font-bold text-white">
                {initials || <UserIcon className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="text-sm font-semibold">{name}</p>
            {email ? (
              <p className="truncate text-xs text-[var(--sea-ink-soft)]">
                {email}
              </p>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/">Favorit</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/">Pengaturan</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={async () => {
              await authClient.signOut()
              void navigate({ to: '/' })
            }}
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="rounded-full text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]"
      >
        <Link to="/sign-in">Masuk</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="rounded-full bg-[var(--lagoon-deep)] text-white hover:bg-[#246f76]"
      >
        <Link to="/sign-up">Daftar</Link>
      </Button>
    </div>
  )
}
