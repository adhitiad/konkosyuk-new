import { z } from 'zod'

export const NearbyFilterSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radius_km: z.number().default(10),
})

export const PropertyTypeSchema = z.enum([
  'kost',
  'kostan',
  'kontrakan',
  'ruko',
  'apartment',
  'house',
  'room',
  'studio',
  'boarding_house',
  'homestay',
])

export const GenderTypeSchema = z.enum(['putri', 'putra', 'campur'])

export const RentalPeriodSchema = z.enum(['harian', 'mingguan', 'bulanan'])

export const PropertyStatusSchema = z.enum([
  'aktif',
  'nonaktif',
  'draft',
  'pending_review',
  'rejected',
  'archived',
])

export const UnitStatusSchema = z.enum([
  'available',
  'occupied',
  'maintenance',
  'reserved',
  'unavailable',
])

export const PropertySchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  address: z.string(),
  province: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  type: PropertyTypeSchema,
  gender_type: GenderTypeSchema.optional(),
  rental_period: RentalPeriodSchema.optional(),
  base_price: z.number().optional(),
  packages: z.any().optional(),
  status: PropertyStatusSchema.optional(),
  amenities: z.any().optional(),
  metadata: z.any().optional(),
  images: z.any().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  gps_verified: z.boolean().optional(),
  featured_until: z.date().optional(),
  ical_export_token: z.string().optional(),
  ical_import_url: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
})

export const CreatePropertyInput = z.object({
  name: z.string(),
  description: z.string().optional(),
  address: z.string(),
  province: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  type: PropertyTypeSchema,
  gender_type: GenderTypeSchema.optional(),
  rental_period: RentalPeriodSchema.optional(),
  base_price: z.number().optional(),
  packages: z.any().optional(),
  amenities: z.any().optional(),
  metadata: z.any().optional(),
  images: z.any().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  gps_verified: z.boolean().optional(),
  featured_until: z.date().optional(),
  ical_import_url: z.string().optional(),
})

export const UpdatePropertyInput = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  type: PropertyTypeSchema.optional(),
  gender_type: GenderTypeSchema.optional(),
  rental_period: RentalPeriodSchema.optional(),
  base_price: z.number().optional(),
  packages: z.any().optional(),
  status: PropertyStatusSchema.optional(),
  amenities: z.any().optional(),
  metadata: z.any().optional(),
  images: z.any().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  gps_verified: z.boolean().optional(),
  featured_until: z.date().optional(),
  ical_export_token: z.string().optional(),
  ical_import_url: z.string().optional(),
})

export const UnitSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  capacity: z.number().optional(),
  size: z.string().optional(),
  status: UnitStatusSchema.optional(),
  metadata: z.any().optional(),
  room_size: z.number().optional(),
  electricity_included: z.boolean().optional(),
  furniture_included: z.boolean().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
})

export const CreateUnitInput = z.object({
  property_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  capacity: z.number().optional(),
  size: z.string().optional(),
  metadata: z.any().optional(),
  room_size: z.number().optional(),
  electricity_included: z.boolean().optional(),
  furniture_included: z.boolean().optional(),
})

export const UpdateUnitInput = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  capacity: z.number().optional(),
  size: z.string().optional(),
  status: UnitStatusSchema.optional(),
  metadata: z.any().optional(),
  room_size: z.number().optional(),
  electricity_included: z.boolean().optional(),
  furniture_included: z.boolean().optional(),
})

export const CheckUnitAvailabilityInput = z.object({
  unit_id: z.string().uuid(),
  start_date: z.date(),
  end_date: z.date(),
})

export const CheckPropertyAvailabilityInput = z.object({
  property_id: z.string().uuid(),
  start_date: z.date(),
  end_date: z.date(),
})

export const UnitAvailabilityResult = z.object({
  unit_id: z.string().uuid(),
  available: z.boolean(),
})

export const PropertyAvailabilityResult = z.object({
  property_id: z.string().uuid(),
  available: z.boolean(),
  available_units: z.number(),
  total_units: z.number(),
  units: z.array(UnitAvailabilityResult),
})
