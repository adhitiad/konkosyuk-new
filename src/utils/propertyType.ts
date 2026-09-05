import type { PropertyType } from '#/generated/prisma/client'

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  kost: 'Kost',
  kostan: 'Kostan',
  kontrakan: 'Kontrakan',
  ruko: 'Ruko',
  apartment: 'Apartemen',
  house: 'Rumah',
  room: 'Kamar',
  studio: 'Studio',
  boarding_house: 'Rumah Kost',
  homestay: 'Homestay',
}

export function getPropertyTypeName(type: string): string {
  return type in PROPERTY_TYPE_LABELS
    ? PROPERTY_TYPE_LABELS[type as PropertyType]
    : type
}
