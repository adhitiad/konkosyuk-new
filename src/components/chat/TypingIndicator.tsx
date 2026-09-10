type TypingIndicatorProps = {
  isTyping: boolean
  userName: string
}

export function TypingIndicator({ isTyping, userName }: TypingIndicatorProps) {
  if (!isTyping) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--lagoon-deep)] [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--lagoon-deep)] [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--lagoon-deep)]" />
      </div>
      <span className="text-xs text-[var(--sea-ink-soft)]">
        {userName} sedang mengetik...
      </span>
    </div>
  )
}
