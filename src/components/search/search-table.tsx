import { useState, useMemo } from 'react'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { getPropertyTypeName } from '#/utils/propertyType'
import { ROOM_STATUS_LABELS, formatRupiah } from '#/types/search'
import type { SearchRoomRow } from '#/types/search'

type SortDirection = 'asc' | 'desc' | null

type SortConfig = {
  key: keyof SearchRoomRow | null
  direction: SortDirection
}

type SearchTableProps = {
  rows: SearchRoomRow[]
  pageSize?: number
}

export function SearchTable({
  rows,
  pageSize: initialPageSize = 20,
}: SearchTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  })
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const sortedRows = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return rows
    }
    const sorted = [...rows].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue === bValue) return 0

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      const aString = String(aValue ?? '')
      const bString = String(bValue ?? '')
      const comparison = aString.localeCompare(bString, 'id-ID')
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [rows, sortConfig])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const safePageIndex = pageIndex >= totalPages ? totalPages - 1 : pageIndex
  const paginatedRows = sortedRows.slice(
    safePageIndex * pageSize,
    (safePageIndex + 1) * pageSize,
  )

  function handleSort(key: keyof SearchRoomRow) {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      return { key: null, direction: null }
    })
    setPageIndex(0)
  }

  function getSortIndicator(key: keyof SearchRoomRow) {
    if (sortConfig.key !== key || !sortConfig.direction) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-neutral-400" />
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 rotate-180" />
    }
    return <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
  }

  const pageSizeOptions = [10, 20, 50, 100]

  return (
    <div className="rounded-xl border border-[var(--line)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                label="Kamar"
                sortKey="name"
                sortConfig={sortConfig}
                onSort={handleSort}
                sortIndicator={getSortIndicator}
              />
              <SortableTableHead
                label="Properti"
                sortKey="property_name"
                sortConfig={sortConfig}
                onSort={handleSort}
                sortIndicator={getSortIndicator}
              />
              <SortableTableHead
                label="Kota"
                sortKey="property_city"
                sortConfig={sortConfig}
                onSort={handleSort}
                sortIndicator={getSortIndicator}
              />
              <SortableTableHead
                label="Tipe"
                sortKey="property_type"
                sortConfig={sortConfig}
                onSort={handleSort}
                sortIndicator={getSortIndicator}
              />
              <SortableTableHead
                label="Harga"
                sortKey="price"
                sortConfig={sortConfig}
                onSort={handleSort}
                sortIndicator={getSortIndicator}
              />
              <TableHead>Fasilitas</TableHead>
              <SortableTableHead
                label="Status"
                sortKey="status"
                sortConfig={sortConfig}
                onSort={handleSort}
                sortIndicator={getSortIndicator}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-[var(--sea-ink-soft)]"
                >
                  Tidak ada kamar yang cocok dengan filter pencarian.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Link
                        to="/properties/$id"
                        params={{ id: row.property_id }}
                        className="font-medium text-[var(--lagoon-deep)] hover:underline"
                      >
                        {row.property_name}
                      </Link>
                      <span className="text-xs text-[var(--sea-ink-soft)]">
                        {row.property_address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{row.property_city ?? '-'}</TableCell>
                  <TableCell>
                    {getPropertyTypeName(row.property_type)}
                  </TableCell>
                  <TableCell className="font-semibold text-[var(--lagoon-deep)]">
                    {formatRupiah(row.price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.facilities.map((facility) => (
                        <Badge
                          key={facility}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.status === 'available' ? 'default' : 'secondary'
                      }
                    >
                      {ROOM_STATUS_LABELS[row.status] ?? row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-[var(--line)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-[var(--sea-ink-soft)]">
            Menampilkan{' '}
            {paginatedRows.length === 0 ? 0 : safePageIndex * pageSize + 1} -{' '}
            {Math.min((safePageIndex + 1) * pageSize, sortedRows.length)} dari{' '}
            {sortedRows.length} kamar
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={safePageIndex === 0}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <span className="text-xs text-[var(--sea-ink-soft)]">
              Halaman {safePageIndex + 1} dari {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPageIndex((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={safePageIndex >= totalPages - 1}
              className="rounded-full"
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v))
                setPageIndex(0)
              }}
            >
              <SelectTrigger className="h-8 w-[5.5rem]">
                <SelectValue placeholder="Baris" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} baris
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

type SortableTableHeadProps = {
  label: string
  sortKey: keyof SearchRoomRow
  sortConfig: SortConfig
  onSort: (key: keyof SearchRoomRow) => void
  sortIndicator: (key: keyof SearchRoomRow) => React.ReactNode
}

function SortableTableHead({
  label,
  sortKey,
  sortConfig,
  onSort,
  sortIndicator,
}: SortableTableHeadProps) {
  const isActive = sortConfig.key === sortKey && sortConfig.direction !== null

  return (
    <TableHead>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-xs font-medium"
        onClick={() => onSort(sortKey)}
        aria-sort={
          isActive
            ? sortConfig.direction === 'asc'
              ? 'ascending'
              : 'descending'
            : 'none'
        }
      >
        {label}
        {sortIndicator(sortKey)}
      </Button>
    </TableHead>
  )
}
