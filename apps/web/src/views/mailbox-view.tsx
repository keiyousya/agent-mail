import { useState, useCallback, useEffect, useRef } from "react"
import { useParams } from "@tanstack/react-router"
import { MailList } from "@/components/mail-list/mail-list"
import { MailDetail } from "@/components/mail-detail/mail-detail"
import { SearchView } from "@/components/search/search-view"
import { ResizableHandle } from "@/components/ui/resizable-handle"
import { useUIStore } from "@/stores/ui"
import { cn } from "@/lib/utils"
import { Mail } from "lucide-react"

export function MailboxView() {
  const { path } = useParams({ from: "/mailbox/$path" })
  const [selectedUid, setSelectedUid] = useState<number | null>(null)
  const [listWidth, setListWidth] = useState(380)
  const searchOpen = useUIStore((s) => s.searchOpen)
  const prevPath = useRef(path)

  // Clear selected message when switching folders
  useEffect(() => {
    if (path !== prevPath.current) {
      setSelectedUid(null)
      prevPath.current = path
    }
  }, [path])

  const handleResize = useCallback((delta: number) => {
    setListWidth((w) => Math.max(260, Math.min(600, w + delta)))
  }, [])

  const handleSelectFromSearch = (uid: number, _mailboxPath: string) => {
    setSelectedUid(uid)
    useUIStore.getState().setSearchOpen(false)
  }

  return (
    <div className="flex h-full flex-1 overflow-hidden">
      {/* Message list column - always fixed width on md+ */}
      <div
        className={cn(
          "h-full flex-shrink-0 border-r border-border/40",
          selectedUid ? "hidden md:block" : "w-full md:w-auto md:block"
        )}
        style={{ width: listWidth, minWidth: listWidth }}
      >
        {searchOpen ? (
          <SearchView onSelectMessage={handleSelectFromSearch} />
        ) : (
          <MailList
            mailboxPath={path}
            selectedUid={selectedUid}
            onSelectMessage={(uid) => setSelectedUid(uid)}
          />
        )}
      </div>

      {/* Resize handle */}
      <ResizableHandle onResize={handleResize} className="hidden md:block" />

      {/* Detail column */}
      <div className={cn("h-full flex-1 min-w-0", selectedUid ? "block" : "hidden md:block")}>
        {selectedUid ? (
          <MailDetail
            mailboxPath={path}
            uid={selectedUid}
            onBack={() => setSelectedUid(null)}
            onDeleted={() => setSelectedUid(null)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground/50">
            <Mail className="mb-4 size-16 opacity-10" />
            <p className="text-sm text-muted-foreground">メールを選択してください</p>
          </div>
        )}
      </div>
    </div>
  )
}
