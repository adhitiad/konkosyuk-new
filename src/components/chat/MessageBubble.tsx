'use client'

import { CheckCheck, Download, FileText } from 'lucide-react'
import { useState } from 'react'

import { cn } from '#/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from '#/components/ui/message'
import { Bubble, BubbleContent, BubbleGroup } from '#/components/ui/bubble'

type Attachment = {
  url: string
  type: string
  filename: string
  size: number
}

type MessageBubbleProps = {
  message: {
    id: string
    content: string | null
    attachments: Attachment[] | null
    isRead: boolean
    createdAt: Date
    sender: {
      id: string
      name: string
      image: string | null
    }
  }
  isOwnMessage: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageType(type: string): boolean {
  return type.startsWith('image/')
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  return (
    <>
      <Message align={isOwnMessage ? 'end' : 'start'}>
        <MessageAvatar>
          <Avatar size="sm" className="h-8 w-8">
            <AvatarImage src={message.sender.image ?? undefined} />
            <AvatarFallback>
              {message.sender.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <BubbleGroup>
            <Bubble
              align={isOwnMessage ? 'end' : 'start'}
              variant={isOwnMessage ? 'default' : 'muted'}
            >
              <BubbleContent>
                {message.content && (
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {message.content}
                  </p>
                )}

                {message.attachments && message.attachments.length > 0 && (
                  <div
                    className={cn('space-y-2', message.content ? 'mt-2' : '')}
                  >
                    {message.attachments.map((attachment) => (
                      <div key={attachment.url}>
                        {isImageType(attachment.type) ? (
                          <button
                            type="button"
                            onClick={() => setImagePreview(attachment.url)}
                            className="block overflow-hidden rounded-lg"
                          >
                            <img
                              src={attachment.url}
                              alt={attachment.filename}
                              className="max-h-48 w-full rounded-lg object-cover"
                            />
                          </button>
                        ) : (
                          <div
                            className={cn(
                              'flex items-center gap-2 rounded-lg border p-2',
                              isOwnMessage
                                ? 'border-white/20 text-white'
                                : 'border-[var(--line)]',
                            )}
                          >
                            <FileText className="h-5 w-5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium">
                                {attachment.filename}
                              </p>
                              <p
                                className={cn(
                                  'text-xs opacity-70',
                                  isOwnMessage
                                    ? 'text-white/80'
                                    : 'text-[var(--sea-ink-soft)]',
                                )}
                              >
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                            <a
                              href={attachment.url}
                              download={attachment.filename}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </BubbleContent>
            </Bubble>
          </BubbleGroup>
          <MessageFooter>
            <span className="text-xs text-[var(--sea-ink-soft)]">
              {new Date(message.createdAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {isOwnMessage && (
              <CheckCheck
                className={cn(
                  'h-3 w-3',
                  message.isRead ? 'text-[var(--lagoon-deep)]' : 'opacity-50',
                )}
              />
            )}
          </MessageFooter>
        </MessageContent>
      </Message>

      {imagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setImagePreview(null)}
        >
          <img
            src={imagePreview}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        </div>
      )}
    </>
  )
}
