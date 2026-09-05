import { z } from 'zod'
import { prisma } from '#/db'
import { os } from '#/orpc/server'

const USER_LOCALE_KEY = 'user_locale'

const LocaleSchema = z.enum(['id', 'en', 'zh', 'th', 'vi', 'ko', 'ru', 'fil'])

export const getUserLocale = os
  .input(z.object({ userId: z.string().uuid() }))
  .handler(async ({ input }) => {
    const row = await prisma.app_settings.findUnique({
      where: { key: `${USER_LOCALE_KEY}:${input.userId}` },
    })
    if (!row) return { locale: null as string | null }
    const parsed = LocaleSchema.safeParse(row.value)
    return { locale: parsed.success ? parsed.data : null }
  })

export const setUserLocale = os
  .input(z.object({ userId: z.string().uuid(), locale: LocaleSchema }))
  .handler(async ({ input }) => {
    const key = `${USER_LOCALE_KEY}:${input.userId}`
    await prisma.app_settings.upsert({
      where: { key },
      create: {
        key,
        value: input.locale,
        is_secret: false,
        description: 'Preferred UI locale for the user',
      },
      update: { value: input.locale, updated_at: new Date() },
    })
    return { ok: true, locale: input.locale }
  })
