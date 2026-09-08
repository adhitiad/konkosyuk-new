import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, Eye, EyeOff, KeyRound, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'
import { Input } from '#/components/ui/input'
import { Separator } from '#/components/ui/separator'

const SignInSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
  remember: z.boolean().default(false),
})

type SignInValues = z.input<typeof SignInSchema>

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignInPage,
  validateSearch: (search: Record<string, unknown>) => {
    const redirect = search.redirect
    return {
      redirect:
        typeof redirect === 'string' &&
        redirect.startsWith('/') &&
        !redirect.startsWith('//')
          ? redirect
          : undefined,
    }
  },
})

function SignInPage() {
  const navigate = useNavigate()
  const redirect = Route.useSearch({ select: (s) => s.redirect })
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const mutation = useMutation({
    mutationFn: async (values: SignInValues) => {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.remember,
      })
      if (result.error) {
        throw new Error(result.error.message ?? 'Email atau kata sandi salah')
      }
      return result.data
    },
    onSuccess: (data) => {
      const userRole = (data as { user: { role: string } }).user.role
      let targetPath = redirect ?? '/'
      if (
        userRole === 'PEMILIK' ||
        userRole === 'ADMIN' ||
        userRole === 'STAFF'
      ) {
        targetPath = '/pemilik/dashboard'
      } else if (userRole === 'PENYEWA') {
        targetPath = '/penyewa/booking'
      }
      void navigate({ to: targetPath })
    },
  })

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null

  return (
    <Card className="island-shell rise-in w-full max-w-md gap-0 border-[var(--line)] py-0">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-2xl font-bold text-[var(--sea-ink)]">
          Masuk ke Konkosyuk
        </CardTitle>
        <CardDescription>
          Lanjut cari kos favoritmu atau kelola properti kamu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal masuk</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-3"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="sign-in-email">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sea-ink-soft)]" />
                      <Input
                        id="sign-in-email"
                        type="email"
                        autoComplete="email"
                        placeholder="nama@email.com"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel htmlFor="sign-in-password">Kata sandi</FormLabel>
                    <a
                      href="#"
                      className="text-xs font-medium text-[var(--lagoon-deep)] no-underline hover:underline"
                    >
                      Lupa kata sandi?
                    </a>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sea-ink-soft)]" />
                      <Input
                        id="sign-in-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Minimal 8 karakter"
                        className="px-9"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
                        aria-label={
                          showPassword
                            ? 'Sembunyikan kata sandi'
                            : 'Tampilkan kata sandi'
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
                    <Checkbox
                      id="sign-in-remember"
                      name="remember"
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                    />
                    <label htmlFor="sign-in-remember">Ingat saya</label>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full bg-[var(--lagoon-deep)] text-white hover:bg-[#246f76]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>
        </Form>

        <div className="flex items-center gap-3 py-1">
          <Separator className="flex-1" />
          <span className="text-xs text-[var(--sea-ink-soft)]">
            atau lanjut dengan
          </span>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" type="button" className="rounded-full">
            Google
          </Button>
          <Button variant="outline" type="button" className="rounded-full">
            Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-[var(--sea-ink-soft)]">
          Belum punya akun?{' '}
          <Link
            to="/sign-up"
            className="font-semibold text-[var(--lagoon-deep)] no-underline hover:underline"
          >
            Daftar di sini
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
