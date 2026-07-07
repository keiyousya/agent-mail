import {
  Inbox, Send, FileText, Trash2,
  FolderOpen, PenSquare, Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useMailboxes } from "@/api/queries"
import { useUIStore } from "@/stores/ui"
import { cn } from "@/lib/utils"

const SYSTEM_FOLDER_DEFS = [
  { label: "受信トレイ", icon: Inbox, specialUse: "\\Inbox" },
  { label: "送信済み", icon: Send, specialUse: "\\Sent" },
  { label: "下書き", icon: FileText, specialUse: "\\Drafts" },
  { label: "ゴミ箱", icon: Trash2, specialUse: "\\Trash" },
]

interface SidebarProps {
  currentPath: string
  onNavigate: (path: string) => void
}

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const { data: mailboxes, isLoading } = useMailboxes()
  const openCompose = useUIStore((s) => s.openCompose)
  const { setSearchOpen, searchOpen } = useUIStore()

  const systemFolders = SYSTEM_FOLDER_DEFS.map((def) => {
    // Find by specialUse first; if empty (total=0), look for a name-based match with actual mail
    let mb = mailboxes?.find((m) => m.specialUse === def.specialUse)
    if (mb && mb.total === 0) {
      const nameMap: Record<string, string[]> = {
        "\\Sent": ["Sent Messages", "Sent"],
        "\\Drafts": ["Drafts", "Draft"],
        "\\Trash": ["Deleted Messages", "Trash"],
      }
      const altNames = nameMap[def.specialUse] || []
      const alt = mailboxes?.find(
        (m) => altNames.includes(m.name) && m.total > 0 && m.path !== mb!.path
      )
      if (alt) mb = alt
    }
    return { ...def, path: mb?.path || "", mailbox: mb }
  }).filter((f) => f.path)

  const systemPaths = new Set(systemFolders.map((f) => f.path))
  const customFolders = mailboxes?.filter(
    (mb) => !systemPaths.has(mb.path) && mb.path !== "INBOX"
  )

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="p-4 pb-3">
        <Button
          className="w-full justify-start gap-2.5 rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all duration-200 h-10 font-medium"
          onClick={() => openCompose()}
        >
          <PenSquare className="size-4" />
          新規メール
        </Button>
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
            searchOpen
              ? "bg-foreground/[0.06] text-foreground font-medium"
              : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Search className="size-4" />
          検索
        </button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-0.5 pb-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2">
                  <Skeleton className="size-[18px] rounded" />
                  <Skeleton className="h-4 flex-1 rounded" />
                </div>
              ))
            : systemFolders.map((folder) => {
                const isActive = currentPath === folder.path
                return (
                  <button
                    key={folder.path}
                    onClick={() => onNavigate(folder.path)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-foreground/[0.06] text-foreground font-semibold"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <folder.icon className={cn("size-[18px] shrink-0", isActive && "text-foreground")} />
                    <span className="flex-1 text-left">{folder.label}</span>
                    {folder.mailbox && folder.mailbox.unseen > 0 && (
                      <span className={cn(
                        "text-xs font-semibold tabular-nums min-w-[20px] text-center",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {folder.mailbox.unseen}
                      </span>
                    )}
                  </button>
                )
              })}

          {customFolders && customFolders.length > 0 && (
            <>
              <div className="my-3 h-px bg-sidebar-border" />
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                フォルダ
              </p>
              {customFolders.map((folder) => {
                const isActive = currentPath === folder.path
                return (
                  <button
                    key={folder.path}
                    onClick={() => onNavigate(folder.path)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all duration-150",
                      isActive
                        ? "bg-foreground/[0.06] text-foreground font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <FolderOpen className={cn("size-[18px] shrink-0", isActive && "text-primary")} />
                    <span className="flex-1 text-left truncate">{folder.name}</span>
                    {folder.unseen > 0 && (
                      <span className={cn(
                        "text-xs font-semibold tabular-nums",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {folder.unseen}
                      </span>
                    )}
                  </button>
                )
              })}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
