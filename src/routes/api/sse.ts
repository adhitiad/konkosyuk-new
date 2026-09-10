import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { SSEManager } from '#/server/sse'

export const Route = createFileRoute('/api/sse')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session?.user) {
          return new Response('Unauthorized', { status: 401 })
        }

        const userId = session.user.id
        const encoder = new TextEncoder()
        let heartbeat: ReturnType<typeof setInterval> | undefined
        let connection:
          | { response: Response; controller: ReadableStreamDefaultController }
          | undefined

        const stream = new ReadableStream({
          start(controller) {
            connection = {
              response: new Response(stream, {
                headers: {
                  'Content-Type': 'text/event-stream',
                  'Cache-Control': 'no-cache',
                  Connection: 'keep-alive',
                },
              }),
              controller,
            }

            SSEManager.addUserConnection(userId, connection)

            controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'))

            heartbeat = setInterval(() => {
              try {
                controller.enqueue(encoder.encode(': heartbeat\n\n'))
              } catch {
                if (heartbeat) clearInterval(heartbeat)
              }
            }, 30_000)
          },
          cancel() {
            if (heartbeat) {
              clearInterval(heartbeat)
            }
            if (connection) {
              SSEManager.removeUserConnection(userId, connection)
            }
          },
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      },
    },
  },
})
