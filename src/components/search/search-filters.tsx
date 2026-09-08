import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react'

import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Slider } from '#/components/ui/slider'
import { PROPERTY_TYPE_LABELS } from '#/utils/propertyType'
import type { PropertyType } from '#/generated/prisma/client'
import {
  FACILITY_OPTIONS,
  HARGA_MAX,
  HARGA_MIN,
  HARGA_STEP,
  formatRupiah,
} from '#/types/search'

export type SearchFilterState = {
  city: string
  search: string
  type: PropertyType | undefined
  priceRange: [number, number]
  facilities: string[]
}

type SearchFiltersProps = {
  value: SearchFilterState
  onChange: (patch: Partial<SearchFilterState>) => void
  showFilters: boolean
  onToggleFilters: () => void
  onClear: () => void
}

export function countActiveFilters(value: SearchFilterState): number {
  return [
    value.city.trim() !== '',
    value.search.trim() !== '',
    value.type !== undefined,
    value.priceRange[0] > HARGA_MIN || value.priceRange[1] < HARGA_MAX,
    value.facilities.length > 0,
  ].filter(Boolean).length
}

export function SearchFilters({
  value,
  onChange,
  showFilters,
  onToggleFilters,
  onClear,
}: SearchFiltersProps) {
  const activeCount = countActiveFilters(value)
  const hargaDiubah =
    value.priceRange[0] > HARGA_MIN || value.priceRange[1] < HARGA_MAX

  function toggleFacility(facility: string) {
    const next = value.facilities.includes(facility)
      ? value.facilities.filter((item) => item !== facility)
      : [...value.facilities, facility]
    onChange({ facilities: next })
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-neutral-200 px-3 focus-within:ring-1 focus-within:ring-[var(--lagoon-deep)] dark:border-neutral-700">
          <Search className="h-4 w-4 shrink-0 text-[var(--lagoon-deep)]" />
          <Input
            id="cari-kata-kunci"
            type="text"
            placeholder="Nama properti, area, atau kata kunci"
            value={value.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="h-auto w-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex flex-1 items-center gap-2 rounded-md border border-neutral-200 px-3 focus-within:ring-1 focus-within:ring-[var(--lagoon-deep)] dark:border-neutral-700">
          <MapPin className="h-4 w-4 shrink-0 text-[var(--lagoon-deep)]" />
          <Input
            id="cari-kota"
            type="text"
            placeholder="Kota"
            value={value.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="h-auto w-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="gap-2"
          onClick={onToggleFilters}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {activeCount > 0 && (
            <Badge
              variant="default"
              className="bg-[var(--lagoon-deep)] text-white"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-4 border-t border-[var(--line)] pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label
              htmlFor="cari-tipe"
              className="text-xs font-medium text-[var(--sea-ink-soft)]"
            >
              Tipe Properti
            </label>
            <Select
              value={value.type ?? ''}
              onValueChange={(v) =>
                onChange({ type: v === '' ? undefined : (v as PropertyType) })
              }
            >
              <SelectTrigger id="cari-tipe" className="w-full">
                <SelectValue placeholder="Semua tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua tipe</SelectItem>
                {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map(
                  (type) => (
                    <SelectItem key={type} value={type}>
                      {PROPERTY_TYPE_LABELS[type]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="cari-harga"
                className="text-xs font-medium text-[var(--sea-ink-soft)]"
              >
                Rentang Harga
              </label>
              <span className="text-xs text-[var(--sea-ink-soft)]">
                {formatRupiah(value.priceRange[0])} —{' '}
                {formatRupiah(value.priceRange[1])}
              </span>
            </div>
            <Slider
              id="cari-harga"
              min={HARGA_MIN}
              max={HARGA_MAX}
              step={HARGA_STEP}
              value={value.priceRange}
              onValueChange={(next) =>
                onChange({ priceRange: next as [number, number] })
              }
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-[var(--sea-ink-soft)]">
              Fasilitas
            </span>
            <div className="flex flex-wrap gap-2">
              {FACILITY_OPTIONS.map((option) => {
                const Icon = option.icon
                const checked = value.facilities.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleFacility(option.value)}
                    aria-pressed={checked}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                      checked
                        ? 'border-[var(--lagoon-deep)] bg-[var(--lagoon-deep)]/10 text-[var(--lagoon-deep)]'
                        : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <div className="flex flex-col gap-2 border-t border-[var(--line)] pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {value.city.trim() !== '' && (
              <Badge variant="secondary" className="text-xs">
                Kota: {value.city}
              </Badge>
            )}
            {value.search.trim() !== '' && (
              <Badge variant="secondary" className="text-xs">
                Pencarian: {value.search}
              </Badge>
            )}
            {value.type && (
              <Badge variant="secondary" className="text-xs">
                Tipe: {PROPERTY_TYPE_LABELS[value.type]}
              </Badge>
            )}
            {hargaDiubah && (
              <Badge variant="secondary" className="text-xs">
                Harga: {formatRupiah(value.priceRange[0])} -{' '}
                {formatRupiah(value.priceRange[1])}
              </Badge>
            )}
            {value.facilities.map((facility) => (
              <Badge key={facility} variant="secondary" className="text-xs">
                {facility}
              </Badge>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="gap-1 self-start text-xs sm:self-auto"
          >
            <X className="h-3.5 w-3.5" />
            Hapus filter
          </Button>
        </div>
      )}
    </div>
  )
}
