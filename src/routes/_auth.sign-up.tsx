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

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" type="button" className="rounded-full">
            Google
          </Button>
          <Button variant="outline" type="button" className="rounded-full">
            Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-[var(--sea-ink-soft)]">
          Sudah punya akun?{' '}
          <Link
            to="/sign-in"
            className="font-semibold text-[var(--lagoon-deep)] no-underline hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
