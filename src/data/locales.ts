export type Locale = 'id' | 'en' | 'zh' | 'th' | 'vi' | 'ko' | 'ru' | 'fil'

export type LocaleMeta = {
  code: Locale
  flag: string
  nativeName: string
  englishName: string
  region: string
  /** RTL script? (none of our locales are RTL — placeholder for future) */
  rtl?: boolean
}

export const LOCALES: LocaleMeta[] = [
  {
    code: 'id',
    flag: '🇮🇩',
    nativeName: 'Bahasa Indonesia',
    englishName: 'Indonesian',
    region: 'ID',
  },
  {
    code: 'en',
    flag: '🇺🇸',
    nativeName: 'English',
    englishName: 'English',
    region: 'US',
  },
  {
    code: 'zh',
    flag: '🇨🇳',
    nativeName: '简体中文',
    englishName: 'Chinese (Simplified)',
    region: 'CN',
  },
  {
    code: 'th',
    flag: '🇹🇭',
    nativeName: 'ภาษาไทย',
    englishName: 'Thai',
    region: 'TH',
  },
  {
    code: 'vi',
    flag: '🇻🇳',
    nativeName: 'Tiếng Việt',
    englishName: 'Vietnamese',
    region: 'VN',
  },
  {
    code: 'ko',
    flag: '🇰🇷',
    nativeName: '한국어',
    englishName: 'Korean',
    region: 'KR',
  },
  {
    code: 'ru',
    flag: '🇷🇺',
    nativeName: 'Русский',
    englishName: 'Russian',
    region: 'RU',
  },
  {
    code: 'fil',
    flag: '🇵🇭',
    nativeName: 'Filipino',
    englishName: 'Filipino',
    region: 'PH',
  },
]

export const SUGGESTED_LOCALE: Locale = 'id'

export function getLocaleMeta(code: string): LocaleMeta | undefined {
  return LOCALES.find((l) => l.code === code)
}
