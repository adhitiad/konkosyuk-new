import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { orpc } from '#/orpc/client'
import { SearchFilters } from '#/components/search/search-filters'
import type { SearchFilterState } from '#/components/search/search-filters'
import { SearchTable } from '#/components/search/search-table'
import type { PropertyType } from '#/generated/prisma/client'

export const Route = createFileRoute('/cari')({
  component: SearchPage,
  head: () => ({
    meta: [
      { title: 'Cari Properti — Konkosyuk' },
      {
        name: 'description',
        content:
          'Cari kos nyaman di seluruh Indonesia dengan filter kota, harga, tipe kamar, dan fasilitas.',
      },
    ],
  }),
})

function SearchPage() {
  const [city, setCity] = useState('')
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<PropertyType | undefined>()
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0, 10_000_000,
  ])
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery(
    orpc.searchRooms.queryOptions({
      input: {
        city: city || undefined,
        type: selectedType,
        price_min: priceRange[0] > 0 ? priceRange[0] : undefined,
        price_max: priceRange[1] < 10_000_000 ? priceRange[1] : undefined,
        facilities:
          selectedFacilities.length > 0 ? selectedFacilities : undefined,
        search: search || undefined,
        limit: 100,
      },
    }),
  )

  const filterState: SearchFilterState = {
    city,
    search,
    type: selectedType,
    priceRange,
    facilities: selectedFacilities,
  }

  function updateFilter(patch: Partial<SearchFilterState>) {
    if ('city' in patch) setCity(patch.city ?? '')
    if ('search' in patch) setSearch(patch.search ?? '')
    if ('type' in patch) setSelectedType(patch.type)
    if ('priceRange' in patch)
      setPriceRange(patch.priceRange ?? [0, 10_000_000])
    if ('facilities' in patch) setSelectedFacilities(patch.facilities ?? [])
  }

  function clearFilters() {
    setCity('')
    setSearch('')
    setSelectedType(undefined)
    setPriceRange([0, 10_000_000])
    setSelectedFacilities([])
  }

  return (
    <main className="page-wrap py-8">
      <div className="mb-6">
        <p className="island-kicker mb-2">Pencarian</p>
        <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
          Cari Properti & Kamar
        </h1>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
          Gunakan filter di bawah untuk menemukan kamar yang sesuai kebutuhanmu.
        </p>
      </div>

      <SearchFilters
        value={filterState}
        onChange={updateFilter}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev: boolean) => !prev)}
        onClear={clearFilters}
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-[var(--sea-ink-soft)]">
          Memuat hasil pencarian...
        </div>
      ) : (
        <SearchTable rows={data?.rows ?? []} pageSize={20} />
      )}
    </main>
  )
}
