import { paraglideMiddleware } from '#/paraglide/server'
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'

const startHandler = createStartHandler(defaultStreamHandler)

export default {
  async fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, () => startHandler(req))
  },
}
