import { ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { MailListItem } from "./mail-list-item"
import { useMessages } from "@/api/queries"
import { useToggleFlag } from "@/api/mutations"
import { useState, useEffect, useRef } from "react"

interface MailListProps {
  mailboxPath: string
  selectedUid: number | null
  onSelectMessage: (uid: number) => void
}

export function MailList({ mailboxPath, selectedUid, onSelectMessage }: MailListProps) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, error } = useMessages(mailboxPath, page)
  const toggleFlag = useToggleFlag(mailboxPath)
  const prevPath = useRef(mailboxPath)
  const [showFolderSkeleton, setShowFolderSkeleton] = useState(false)

  // When switching folders, show skeleton immediately
  useEffect(() => {
    if (mailboxPath !== prevPath.current) {
      setShowFolderSkeleton(true)
      setPage(1)
      prevPath.current = mailboxPath
    }
  }, [mailboxPath])

  // Clear folder skeleton once data arrives
  useEffect(() => {
    if (!isLoading && showFolderSkeleton) {
      setShowFolderSkeleton(false)
    }
  }, [isLoading, showFolderSkeleton])

  const totalPages = data ? Math.ceil(data.total / 20) : 0

  const folderLabel: Record<string, string> = {
    INBOX: "受信トレイ",
    "INBOX.Sent": "送信済み",
    "INBOX.Sent Messages": "送信済み",
    "INBOX.Draft": "下書き",
    "INBOX.Drafts": "下書き",
    "INBOX.Deleted Messages": "ゴミ箱",
    "INBOX.Trash": "ゴミ箱",
    "INBOX.spam": "迷惑メール",
  }

  const shouldShowSkeleton = isLoading || showFolderSkeleton
  const isRefetching = isFetching && !isLoading && !showFolderSkeleton

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-sm font-medium text-destructive">読み込みに失敗しました</p>
          <p className="mt-1.5 text-xs text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{folderLabel[mailboxPath] || mailboxPath}</h2>
          {data && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{data.total}件のメール</p>
          )}
        </div>
      </div>

      {/* Refetch indicator (non-initial loads) */}
      {isRefetching && (
        <div className="flex items-center justify-center gap-1.5 py-1.5 border-b border-border/30 bg-muted/30">
          <Loader2 className="size-3 animate-spin text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">更新中...</span>
        </div>
      )}

      <ScrollArea className="flex-1">
        {shouldShowSkeleton ? (
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-4 py-3 border-b border-border/20">
                {/* Avatar */}
                <div className="relative mt-0.5 shrink-0">
                  <Skeleton className="size-8 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* Sender + date row */}
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-2.5 w-12 rounded" />
                  </div>
                  {/* Subject */}
                  <Skeleton className="mt-1.5 h-3.5 w-48 rounded" />
                  {/* Preview */}
                  <Skeleton className="mt-1.5 h-2.5 w-64 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.messages.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <Inbox className="mb-3 size-12 opacity-15" />
            <p className="text-sm">メールはありません</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {data?.messages.map((msg) => (
              <MailListItem
                key={msg.uid}
                message={msg}
                isSelected={msg.uid === selectedUid}
                onSelect={() => onSelectMessage(msg.uid)}
                onToggleStar={(e) => {
                  e.stopPropagation()
                  toggleFlag.mutate({
                    uid: msg.uid,
                    flag: "\\Flagged",
                    add: !msg.flags.includes("\\Flagged"),
                  })
                }}
                isMutating={toggleFlag.isPending && toggleFlag.variables?.uid === msg.uid}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2">
          <span className="text-[11px] text-muted-foreground tabular-nums">{page}/{totalPages}ページ</span>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="rounded-lg hover:bg-muted transition-colors">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
