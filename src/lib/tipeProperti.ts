import type {
  StatusKetersediaan,
  StatusProperti,
  TipeProperti,
} from '#/lib/validators/property'

export const TIPE_PROPERTI_LABELS: Record<TipeProperti, string> = {
  KOST: 'Kost',
  KONTRAKAN: 'Kontrakan',
}

export function getTipePropertiLabel(tipe: TipeProperti): string {
  return TIPE_PROPERTI_LABELS[tipe]
}

export const STATUS_PROPERTI_LABELS: Record<StatusProperti, string> = {
  DRAFT: 'Draft',
  AKTIF: 'Aktif',
  NONAKTIF: 'Non-aktif',
}

export function getStatusPropertiLabel(status: StatusProperti): string {
  return STATUS_PROPERTI_LABELS[status]
}

export const STATUS_KETERSEDIAAN_LABELS: Record<StatusKetersediaan, string> = {
  TERSEDIA: 'Tersedia',
  TERISI: 'Terisi',
  DIPESAN: 'Dipesan',
  MAINTENANCE: 'Maintenance',
}

export function getStatusKetersediaanLabel(status: StatusKetersediaan): string {
  return STATUS_KETERSEDIAAN_LABELS[status]
}
