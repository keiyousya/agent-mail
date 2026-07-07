import { useEffect, useState } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { MailListItem } from "@/components/mail-list/mail-list-item"
import { useSearch } from "@/api/queries"
import { useUIStore } from "@/stores/ui"

interface SearchViewProps {
  onSelectMessage: (uid: number, mailboxPath: string) => void
}

export function SearchView({ onSelectMessage }: SearchViewProps) {
  const { searchQuery, setSearchQuery, setSearchOpen } = useUIStore()
  const [inputValue, setInputValue] = useState(searchQuery)

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(inputValue), 300)
    return () => clearTimeout(t)
  }, [inputValue, setSearchQuery])

  const { data: results, isLoading, isFetching } = useSearch(searchQuery)

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3">
        <Search className="size-4 text-primary shrink-0" />
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="メールを検索..."
          className="border-0 shadow-none focus-visible:ring-0 h-8 rounded-none bg-transparent text-sm"
          autoFocus
        />
        {isFetching && (
          <Loader2 className="size-4 animate-spin text-muted-foreground shrink-0" />
        )}
        <Button variant="ghost" size="icon-xs" onClick={() => setSearchOpen(false)}
          className="rounded-lg hover:bg-muted transition-colors shrink-0">
          <X className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {!searchQuery ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">キーワードを入力して検索</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-4 py-3 border-b border-border/20">
                <div className="relative mt-0.5 shrink-0">
                  <Skeleton className="size-8 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-2.5 w-12 rounded" />
                  </div>
                  <Skeleton className="mt-1.5 h-3.5 w-48 rounded" />
                  <Skeleton className="mt-1.5 h-2.5 w-64 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : results?.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">「{searchQuery}」に一致するメールはありません</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {results?.map((msg) => (
              <MailListItem
                key={msg.uid}
                message={msg}
                isSelected={false}
                onSelect={() => onSelectMessage(msg.uid, "INBOX")}
                onToggleStar={(e) => e.stopPropagation()}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
