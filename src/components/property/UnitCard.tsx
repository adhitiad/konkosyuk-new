import { Bed, Ruler } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import type { UnitPropertiWithRelations } from '#/types/property'
import { getStatusKetersediaanLabel } from '#/lib/tipeProperti'

type UnitCardProps = {
  unit: UnitPropertiWithRelations
}

const STATUS_BADGE: Record<
  UnitPropertiWithRelations['status_ketersediaan'],
  'default' | 'secondary' | 'outline'
> = {
  TERSEDIA: 'default',
  TERISI: 'secondary',
  DIPESAN: 'outline',
  MAINTENANCE: 'secondary',
}

export function UnitCard({ unit }: UnitCardProps) {
  const price = Number(unit.harga_bulanan)
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--line)] p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[var(--sea-ink)]">
          {unit.nama_unit}
        </h3>
        <Badge variant={STATUS_BADGE[unit.status_ketersediaan]}>
          {getStatusKetersediaanLabel(unit.status_ketersediaan)}
        </Badge>
      </div>

      <p className="text-2xl font-bold text-[var(--lagoon-deep)]">
        Rp{price.toLocaleString('id-ID')}
      </p>

      <div className="flex flex-wrap gap-3 text-xs text-[var(--sea-ink-soft)]">
        <span className="flex items-center gap-1">
          <Ruler className="h-3 w-3" />
          {Number(unit.luas_meter)} m²
        </span>
        <span className="flex items-center gap-1">
          <Bed className="h-3 w-3" />
          {unit.kapasitas} orang
        </span>
      </div>

      {unit.status_ketersediaan === 'TERSEDIA' && (
        <Button asChild size="sm" className="mt-2 w-full">
          <Link
            to="/penyewa/booking/baru"
            search={{ property_id: unit.property_id, unit_id: unit.id }}
          >
            Pesan Kamar Ini
          </Link>
        </Button>
      )}
    </div>
  )
}
