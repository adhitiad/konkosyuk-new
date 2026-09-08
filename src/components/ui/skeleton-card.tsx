import { Skeleton } from '#/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { cn } from '#/lib/utils'

export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        'h-full gap-0 overflow-hidden rounded-2xl border border-[var(--line)] py-0',
        className,
      )}
    >
      <Skeleton className="aspect-[16/10] w-full" />
      <CardHeader className="p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="mt-1 h-4 w-1/4" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-4 pt-0">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-8 w-1/3 self-start rounded-full" />
      </CardContent>
    </Card>
  )
}

export function StatsCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-24" />
            </CardTitle>
            <Skeleton className="h-5 w-5 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}
