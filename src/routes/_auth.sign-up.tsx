import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { authClient } from '#/lib/auth-client'
import { registerSchema } from '#/lib/validators/auth'
import type { RegisterInput } from '#/lib/validators/auth'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'
import { Input } from '#/components/ui/input'
import { Separator } from '#/components/ui/separator'
import { cn } from '#/lib/utils'

type SignUpValues = RegisterInput

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignUpValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'PENYEWA',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: SignUpValues) => {
      const result = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        phone: values.phone || undefined,
      })
      if (result.error) {
        throw new Error(result.error.message ?? 'Pendaftaran gagal')
      }
      return result.data
    },
    onSuccess: () => {
      void navigate({ to: '/' })
    },
  })

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null

  return (
    <Card className="island-shell rise-in w-full max-w-md gap-0 border-[var(--line)] py-0">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-2xl font-bold text-[var(--sea-ink)]">
          Buat Akun Baru
        </CardTitle>
        <CardDescription>
          Daftar gratis, dapat akses ke rekomendasi kos personal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pendaftaran gagal</AlertTitle>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="sign-up-name">Nama lengkap</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sea-ink-soft)]" />
                      <Input
                        id="sign-up-name"
                        autoComplete="name"
                        placeholder="Nama kamu"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="sign-up-email">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sea-ink-soft)]" />
                      <Input
                        id="sign-up-email"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="sign-up-phone">
                    Nomor WhatsApp (opsional)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sea-ink-soft)]" />
                      <Input
                        id="sign-up-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="08xxxxxxxxxx"
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
                  <FormLabel htmlFor="sign-up-password">Kata sandi</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sea-ink-soft)]" />
                      <Input
                        id="sign-up-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
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
                  <FormDescription>Minimal 8 karakter.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <p
                    id="sign-up-role-label"
                    className="text-sm font-medium leading-none"
                  >
                    Daftar sebagai
                  </p>
                  <FormControl>
                    <div
                      className="grid grid-cols-2 gap-2"
                      aria-labelledby="sign-up-role-label"
                    >
                      {(
                        [
                          {
                            value: 'PENYEWA',
                            label: 'Pencari Kos',
                            desc: 'Cari & booking kos',
                          },
                          {
                            value: 'PEMILIK',
                            label: 'Pemilik Kos',
                            desc: 'Pasang iklan kos',
                          },
                        ] as const
                      ).map((opt) => {
                        const active = field.value === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => field.onChange(opt.value)}
                            aria-pressed={active}
                            className={cn(
                              'rounded-xl border p-3 text-left transition',
                              active
                                ? 'border-[var(--lagoon-deep)] bg-[rgba(79,184,178,0.14)] shadow-[0_8px_24px_rgba(50,143,151,0.18)]'
                                : 'border-[var(--line)] bg-white/60 hover:border-[var(--lagoon)]',
                            )}
                          >
                            <p className="text-sm font-semibold text-[var(--sea-ink)]">
                              {opt.label}
                            </p>
                            <p className="text-xs text-[var(--sea-ink-soft)]">
                              {opt.desc}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-[var(--sea-ink-soft)]">
              Dengan mendaftar, kamu menyetujui{' '}
              <a href="#" className="text-[var(--lagoon-deep)] hover:underline">
                Syarat Layanan
              </a>{' '}
              dan{' '}
              <a href="#" className="text-[var(--lagoon-deep)] hover:underline">
                Kebijakan Privasi
              </a>{' '}
              kami.
            </p>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full bg-[var(--lagoon-deep)] text-white hover:bg-[#246f76]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Membuat akun…' : 'Daftar Sekarang'}
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

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            type="button"
            className="rounded-full"
            onClick={() =>
              authClient.signIn.social({ provider: 'google', callbackURL: '/' })
            }
          >
            <img
              src="data:image/png;base64,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"
              className="h-6 w-6"
              alt="google-logo"
            ></img>
            <span className="flex-1 text-sm font-semibold text-[var(--sea-ink)]">
              Google
            </span>
          </Button>
        </div>

        <p className="text-center text-sm text-[var(--sea-ink-soft)]">
          Sudah punya akun?{' '}
          <Link
            to="/sign-in"
            search={{ redirect: undefined }}
            className="font-semibold text-[var(--lagoon-deep)] no-underline hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
