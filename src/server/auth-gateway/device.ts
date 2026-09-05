export interface DeviceInfo {
  readonly deviceId: string | null
  readonly deviceName: string | null
  readonly deviceType: string | null
}

const DEVICE_TYPE_PATTERNS: readonly [RegExp, string][] = [
  [/tablet|ipad|playbook|silk/i, 'tablet'],
  [
    /mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i,
    'mobile',
  ],
  [/macintosh|mac os x/i, 'desktop'],
  [/windows nt/i, 'desktop'],
  [/linux/i, 'desktop'],
  [/cros/i, 'desktop'],
]

export function extractDeviceInfo(headers: Headers): DeviceInfo {
  const deviceId = headers.get('X-Device-ID')?.trim() || null
  const deviceName = headers.get('X-Device-Name')?.trim() || null

  let deviceType: string | null = null
  const userAgent = headers.get('User-Agent')?.trim() || ''

  if (userAgent) {
    for (const [pattern, type] of DEVICE_TYPE_PATTERNS) {
      if (pattern.test(userAgent)) {
        deviceType = type
        break
      }
    }
    if (!deviceType) {
      deviceType = 'desktop'
    }
  }

  return { deviceId, deviceName, deviceType }
}
