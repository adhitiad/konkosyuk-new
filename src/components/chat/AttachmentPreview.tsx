import { FileText, X } from 'lucide-react'

import { Button } from '#/components/ui/button'

type Attachment = {
  url: string
  type: string
  filename: string
  size: number
}

type AttachmentPreviewProps = {
  attachments: Attachment[]
  onRemove: (index: number) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageType(type: string): boolean {
  return type.startsWith('image/')
}

export function AttachmentPreview({
  attachments,
  onRemove,
}: AttachmentPreviewProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {attachments.map((attachment, index) => (
        <div
          key={attachment.url}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[var(--line)]"
        >
          {isImageType(attachment.type) ? (
            <img
              src={attachment.url}
              alt={attachment.filename}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-1">
              <FileText className="h-6 w-6 text-[var(--sea-ink-soft)]" />
              <span className="mt-1 truncate text-[10px] text-[var(--sea-ink-soft)]">
                {formatFileSize(attachment.size)}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full"
            onClick={() => onRemove(index)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}
