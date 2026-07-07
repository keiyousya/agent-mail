import { Star, Paperclip, CircleDot } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { MessageEnvelope } from "@/api/types"
import { cn, formatMailDate, getInitials, getAvatarColor } from "@/lib/utils"

interface MailListItemProps {
  message: MessageEnvelope
  isSelected: boolean
  onSelect: () => void
  onToggleStar: (e: React.MouseEvent) => void
  isMutating?: boolean
}

export function MailListItem({ message, isSelected, onSelect, onToggleStar, isMutating }: MailListItemProps) {
  const isUnread = !message.flags.includes("\\Seen")
  const isStarred = message.flags.includes("\\Flagged")
  const sender = message.from[0]
  const senderName = sender?.name || sender?.address || "不明"

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start gap-3 px-4 py-3 text-left transition-all duration-150",
        !isSelected && "hover:bg-muted/50",
        isMutating && "opacity-60 pointer-events-none",
      )}
      style={isSelected ? { backgroundColor: "#e5e5e5" } : undefined}
    >
      {/* Avatar with unread indicator overlay */}
      <div className="relative mt-0.5 shrink-0">
        <Avatar size="default">
          <AvatarFallback
            className={cn("text-white text-xs font-medium", getAvatarColor(sender?.address || ""))}
            style={isUnread ? { backgroundColor: "#1a1a1a" } : undefined}
          >
            {getInitials(sender?.name, sender?.address)}
          </AvatarFallback>
        </Avatar>
        {isUnread && (
          <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-black ring-2 ring-white" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={cn(
              "truncate text-[13px]",
              isUnread ? "font-bold text-foreground" : "text-foreground/55"
            )}>
              {senderName}
            </span>
            {isUnread && (
              <span className="shrink-0 rounded bg-foreground px-1.5 py-px text-[10px] font-bold text-background leading-tight">
                未読
              </span>
            )}
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
            {formatMailDate(message.date)}
          </span>
        </div>

        <p className={cn(
          "truncate text-[13px] mt-0.5",
          isUnread ? "font-semibold text-foreground" : "text-foreground/45"
        )}>
          {message.subject || "(件名なし)"}
        </p>

        <div className="mt-0.5 flex items-center gap-1.5">
          <p className="flex-1 truncate text-xs text-muted-foreground/70 leading-relaxed">
            {message.preview || "\u00A0"}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            {message.hasAttachments && (
              <Paperclip className="size-3 text-muted-foreground/60" />
            )}
            <button
              onClick={onToggleStar}
              className={cn(
                "rounded-full p-1 transition-all duration-150",
                isStarred
                  ? "text-amber-400"
                  : "text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-amber-400"
              )}
            >
              <Star className="size-3.5" fill={isStarred ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </button>
  )
}
