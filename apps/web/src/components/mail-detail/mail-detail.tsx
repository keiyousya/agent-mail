import {
  Reply, ReplyAll, Forward, Trash2,
  MailOpen, Mail, Paperclip, ArrowLeft, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton, SkeletonText } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMessage } from "@/api/queries"
import { useDeleteMessage, useToggleFlag } from "@/api/mutations"
import { useUIStore } from "@/stores/ui"
import { formatFullDate, getInitials, getAvatarColor, cn } from "@/lib/utils"
import { MailBody } from "./mail-body"

interface MailDetailProps {
  mailboxPath: string
  uid: number
  onBack?: () => void
  onDeleted?: () => void
}

export function MailDetail({ mailboxPath, uid, onBack, onDeleted }: MailDetailProps) {
  const { data: message, isLoading, error } = useMessage(mailboxPath, uid)
  const deleteMessage = useDeleteMessage(mailboxPath)
  const toggleFlag = useToggleFlag(mailboxPath)
  const openCompose = useUIStore((s) => s.openCompose)

  const isActionPending = deleteMessage.isPending || toggleFlag.isPending

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-background">
        {/* Skeleton toolbar */}
        <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="size-8 rounded-lg" />
          ))}
        </div>

        <div className="px-8 py-6 max-w-3xl">
          {/* Subject skeleton */}
          <Skeleton className="mb-6 h-6 w-80 rounded" />

          {/* Sender info skeleton */}
          <div className="flex items-start gap-3.5 mb-6">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
              <Skeleton className="h-3 w-48 rounded" />
              <Skeleton className="h-3 w-56 rounded" />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50 mb-6" />

          {/* Body skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-5/6 rounded" />
            <Skeleton className="h-3 w-4/5 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/5 rounded" />
            <div className="pt-2" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !message) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {error ? "メールの読み込みに失敗しました" : "メールが見つかりません"}
        </p>
      </div>
    )
  }

  const sender = message.from[0]
  const isUnread = !message.flags.includes("\\Seen")

  const handleDelete = () => {
    deleteMessage.mutate(uid, { onSuccess: () => onDeleted?.() })
  }

  const actions = [
    { icon: Reply, label: "返信", onClick: () => openCompose("reply", message) },
    { icon: ReplyAll, label: "全員に返信", onClick: () => openCompose("replyAll", message) },
    { icon: Forward, label: "転送", onClick: () => openCompose("forward", message) },
    {
      icon: isUnread ? MailOpen : Mail,
      label: isUnread ? "既読にする" : "未読にする",
      onClick: () => toggleFlag.mutate({ uid, flag: "\\Seen", add: isUnread }),
    },
    { icon: Trash2, label: "削除", onClick: handleDelete, destructive: true },
  ]

  return (
    <div className="relative flex h-full flex-col bg-background">
      {/* Action overlay spinner */}
      {isActionPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
          <div className="flex items-center gap-2 rounded-lg bg-background border border-border/60 px-4 py-2.5 shadow-sm">
            <Loader2 className="size-4 animate-spin text-foreground/60" />
            <span className="text-sm text-foreground/60">処理中...</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-border/60 px-3 py-1.5">
        {onBack && (
          <Button variant="ghost" size="icon-sm" className="mr-1 lg:hidden rounded-lg" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
        )}
        {actions.map((action) => (
          <Tooltip key={action.label}>
            <TooltipTrigger
              className={cn(
                "inline-flex items-center justify-center size-8 rounded-lg transition-all duration-150",
                action.destructive
                  ? "text-foreground/50 hover:bg-destructive/8 hover:text-destructive"
                  : "text-foreground/50 hover:bg-muted hover:text-foreground",
                isActionPending && "pointer-events-none opacity-50"
              )}
              onClick={action.onClick}
              disabled={isActionPending}
            >
              <action.icon className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{action.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="px-8 py-6 max-w-3xl">
          <h1 className="mb-6 text-xl font-semibold leading-snug tracking-tight text-foreground">
            {message.subject || "(件名なし)"}
          </h1>

          <div className="mb-6 flex items-start gap-3.5">
            <Avatar size="lg" className="shrink-0">
              <AvatarFallback className={cn(getAvatarColor(sender?.address || ""), "text-white text-sm font-medium")}>
                {getInitials(sender?.name, sender?.address)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-foreground">{sender?.name || sender?.address || "不明"}</p>
                <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                  {formatFullDate(message.date)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/80 mt-0.5">{sender?.address}</p>
              {message.to.length > 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  <span className="text-muted-foreground/60">To: </span>
                  {message.to.map((a) => a.name || a.address).join(", ")}
                </p>
              )}
              {message.cc && message.cc.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-muted-foreground/60">Cc: </span>
                  {message.cc.map((a) => a.name || a.address).join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-border/50 mb-6" />
          <MailBody html={message.html} text={message.text} />

          {message.attachments.length > 0 && (
            <>
              <div className="h-px bg-border/50 my-6" />
              <div>
                <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  添付ファイル ({message.attachments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm transition-colors hover:bg-muted/60">
                      <Paperclip className="size-3.5 text-muted-foreground/60" />
                      <span className="truncate max-w-[200px] text-foreground/80">{att.filename}</span>
                      <span className="text-[11px] text-muted-foreground">{formatBytes(att.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}
