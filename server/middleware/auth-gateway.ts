import { defineEventHandler, getRequestHeaders, setHeader } from 'h3'
import { checkAuthGateway } from '#/server/auth-gateway'

export default defineEventHandler(async (event) => {
  const path = event.path || event.node!.req.url || ''

  if (isStaticAsset(path) || isInternalPath(path)) {
    return
  }

  const headers = new Headers()
  const reqHeaders = getRequestHeaders(event)
  for (const [key, value] of Object.entries(reqHeaders)) {
    headers.append(key, value)
  }

  const result = await checkAuthGateway({ headers })

  if (result.response) {
    return result.response
  }

  const { rateLimitInfo } = result.context
  setHeader(event, 'X-RateLimit-Limit', String(rateLimitInfo.limit))
  setHeader(event, 'X-RateLimit-Remaining', String(rateLimitInfo.remaining))
  setHeader(event, 'X-RateLimit-Role', result.context.role)

  event.context.auth = result.context
})

function isStaticAsset(path: string): boolean {
  return /\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|map|json)$/i.test(
    path,
  )
}

function isInternalPath(path: string): boolean {
  return path.startsWith('/_nitro') || path.startsWith('/api/auth')
}
