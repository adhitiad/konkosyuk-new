import { addMonths, addYears } from 'date-fns'

export type BookingRentalPeriod =
  'ONE_MONTH' | 'THREE_MONTHS' | 'SIX_MONTHS' | 'ONE_YEAR'

export function calculateCheckOutDate(
  checkInDate: Date,
  rentalPeriod: BookingRentalPeriod,
): Date {
  switch (rentalPeriod) {
    case 'ONE_MONTH':
      return addMonths(checkInDate, 1)
    case 'THREE_MONTHS':
      return addMonths(checkInDate, 3)
    case 'SIX_MONTHS':
      return addMonths(checkInDate, 6)
    case 'ONE_YEAR':
      return addYears(checkInDate, 1)
    default:
      return addMonths(checkInDate, 1)
  }
}
