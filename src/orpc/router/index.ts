import { searchLocations, reverseGeocode } from './geocoding'
import { addTodo, listTodos } from './todos'
import {
  checkPropertyAvailability,
  checkUnitAvailability,
  createProperty,
  createUnit,
  deleteProperty,
  deleteUnit,
  getProperty,
  listProperties,
  updateProperty,
  updateUnit,
} from './properties'
import {
  confirmBookingRequest,
  createBooking,
  createBookingRequest,
  getPropertyBookingRequests,
  getPropertyBookings,
} from './bookings'
import { getUserLocale, setUserLocale } from './preferences'

export default {
  listTodos,
  addTodo,
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  createUnit,
  updateUnit,
  deleteUnit,
  checkUnitAvailability,
  checkPropertyAvailability,
  createBookingRequest,
  getPropertyBookingRequests,
  getPropertyBookings,
  createBooking,
  confirmBookingRequest,
  getUserLocale,
  setUserLocale,
  searchLocations,
  reverseGeocode,
}
