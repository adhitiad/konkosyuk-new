import { z } from 'zod'
import {
  CreatePropertyInput,
  CreateUnitInput,
  PropertySchema,
  UnitSchema,
  UpdatePropertyInput,
  UpdateUnitInput,
} from './schema/properties'

export const TodoSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
})

export {
  PropertySchema,
  UnitSchema,
  CreatePropertyInput,
  UpdatePropertyInput,
  CreateUnitInput,
  UpdateUnitInput,
}
