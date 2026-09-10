import { Paperclip, Send } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { AttachmentPreview } from '#/components/chat/AttachmentPreview'

type Attachment = {
  url: string
  type: string
  filename: string
  size: number
}

type ChatInputProps = {
  onSend: (input: {
    text: string
    attachments: Attachment[]
  }) => void | Promise<void>
  uploadFile: (file: File) => Promise<Attachment>
  disabled?: boolean
  placeholder?: string
  maxLength?: number
}

const MAX_FILE_SIZE = 8 * 1024 * 1024
const MAX_ATTACHMENTS = 5
const MAX_TOTAL_SIZE = 10 * 1024 * 1024

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const ALLOWED_EXTENSIONS = [
  '.csv',
  '.txt',
  '.md',
  '.xls',
  '.xlsx',
  '.doc',
  '.docx',
]

export function ChatInput({
  onSend,
  uploadFile,
  disabled,
  placeholder = 'Tulis pesan...',
  maxLength = 2000,
}: ChatInputProps) {
  const [text, setText] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [text])

  useEffect(() => {
    const urls = pendingFiles.map((file) => URL.createObjectURL(file))
    const attachments: Attachment[] = pendingFiles.map((file, i) => ({
      url: urls[i],
      type: file.type,
      filename: file.name,
      size: file.size,
    }))
    setPreviews(attachments)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [pendingFiles])

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      const valid: File[] = []
      let totalSize = pendingFiles.reduce((sum, f) => sum + f.size, 0)

      for (const file of files) {
        if (valid.length >= MAX_ATTACHMENTS) break

        const lastDotIndex = file.name.lastIndexOf('.')
        const ext =
          lastDotIndex !== -1 ? file.name.slice(lastDotIndex).toLowerCase() : ''
        const isValidType =
          ALLOWED_MIME_TYPES.includes(file.type) ||
          (ext ? ALLOWED_EXTENSIONS.includes(ext) : false)

        if (!isValidType) {
          toast.error(`Tipe file tidak diizinkan: ${file.name}`)
          continue
        }

        if (file.size > MAX_FILE_SIZE) {
          toast.error(`Ukuran file maksimal 8MB: ${file.name}`)
          continue
        }

        if (totalSize + file.size > MAX_TOTAL_SIZE) {
          toast.error('Total ukuran attachment maksimal 10MB')
          break
        }

        valid.push(file)
        totalSize += file.size
      }

      return valid
    },
    [pendingFiles],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      const valid = validateFiles(files)
      setPendingFiles((prev) => [...prev, ...valid])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [validateFiles],
  )

  const handleRemoveAttachment = useCallback((index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSend = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed && pendingFiles.length === 0) return
    if (disabled) return

    let uploadedAttachments: Attachment[] = []

    if (pendingFiles.length > 0) {
      setIsUploading(true)
      try {
        const uploadPromises = pendingFiles.map((file) => uploadFile(file))
        uploadedAttachments = await Promise.all(uploadPromises)
      } catch {
        toast.error('Gagal mengunggah satu atau lebih file')
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    try {
      await onSend({ text: trimmed, attachments: uploadedAttachments })
      setText('')
      setPendingFiles([])
    } catch {
      toast.error('Gagal mengirim pesan')
    }
  }, [text, pendingFiles, disabled, onSend, uploadFile])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const remainingChars = maxLength - text.length
  const isOverLimit = remainingChars < 0

  return (
    <div className="space-y-2">
      {previews.length > 0 && (
        <AttachmentPreview
          attachments={previews}
          onRemove={handleRemoveAttachment}
        />
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setText(e.target.value)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          <div className="mt-1 flex justify-between">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="h-8 w-8"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <span
              className={cn(
                'text-xs',
                isOverLimit ? 'text-red-500' : 'text-[var(--sea-ink-soft)]',
              )}
            >
              {text.length} / {maxLength}
            </span>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={
            disabled ||
            isUploading ||
            (!text.trim() && pendingFiles.length === 0)
          }
          size="icon"
          className="h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}
