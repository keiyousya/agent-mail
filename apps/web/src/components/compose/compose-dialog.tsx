import { useState, useEffect } from "react"
import { X, Send, Minus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useUIStore } from "@/stores/ui"
import { useSendMail } from "@/api/mutations"
import { cn } from "@/lib/utils"

export function ComposeDialog() {
  const { composeOpen, closeCompose, composeMode, replySource } = useUIStore()
  const sendMail = useSendMail()

  const [to, setTo] = useState("")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [minimized, setMinimized] = useState(false)

  useEffect(() => {
    if (!composeOpen) return
    if (replySource && composeMode !== "new") {
      const src = replySource
      const senderAddr = src.from[0]?.address || ""
      if (composeMode === "reply") {
        setTo(src.replyTo?.[0]?.address || senderAddr)
        setSubject(src.subject?.startsWith("Re:") ? src.subject : `Re: ${src.subject || ""}`)
      } else if (composeMode === "replyAll") {
        setTo(src.replyTo?.[0]?.address || senderAddr)
        const others = src.to.map((a) => a.address).filter((a) => a !== senderAddr).join(", ")
        setCc([others, ...(src.cc?.map((a) => a.address) || [])].filter(Boolean).join(", "))
        setShowCcBcc(true)
        setSubject(src.subject?.startsWith("Re:") ? src.subject : `Re: ${src.subject || ""}`)
      } else if (composeMode === "forward") {
        setSubject(src.subject?.startsWith("Fwd:") ? src.subject : `Fwd: ${src.subject || ""}`)
        setBody(
          `\n\n---------- Forwarded message ----------\nFrom: ${src.from.map((a) => `${a.name || ""} <${a.address}>`).join(", ")}\nDate: ${src.date || ""}\nSubject: ${src.subject || ""}\nTo: ${src.to.map((a) => a.address).join(", ")}\n\n${src.text || ""}`
        )
      }
    } else {
      setTo(""); setCc(""); setBcc(""); setSubject(""); setBody("")
      setShowCcBcc(false)
    }
    setMinimized(false)
  }, [composeOpen, composeMode, replySource])

  if (!composeOpen) return null

  const handleSend = () => {
    sendMail.mutate(
      {
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        cc: cc ? cc.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        bcc: bcc ? bcc.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        subject,
        text: body,
        inReplyTo: (composeMode === "reply" || composeMode === "replyAll") ? replySource?.messageId : undefined,
        references: replySource?.references,
      },
      { onSuccess: () => closeCompose() }
    )
  }

  const modeLabel = { new: "新規メール", reply: "返信", replyAll: "全員に返信", forward: "転送" }[composeMode]

  return (
    <div className={cn(
      "fixed bottom-0 right-6 z-50 flex flex-col rounded-t-2xl border border-border/60 transition-all duration-200",
      minimized
        ? "h-11 w-72 shadow-lg bg-white"
        : "h-[520px] w-[560px] shadow-2xl bg-white"
    )}>
      {/* Header bar */}
      <div
        className="flex items-center justify-between rounded-t-2xl bg-foreground px-4 py-2.5 cursor-pointer select-none"
        onClick={() => setMinimized(!minimized)}
      >
        <span className="text-[13px] font-medium text-background">{modeLabel}</span>
        <div className="flex items-center gap-0.5">
          <button
            className="inline-flex items-center justify-center size-6 rounded-md text-background/70 hover:text-background transition-colors"
            onClick={(e) => { e.stopPropagation(); setMinimized(!minimized) }}
          >
            <Minus className="size-3.5" />
          </button>
          <button
            className="inline-flex items-center justify-center size-6 rounded-md text-background/70 hover:text-background transition-colors"
            onClick={(e) => { e.stopPropagation(); closeCompose() }}
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Sending overlay */}
          {sendMail.isPending && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-t-2xl bg-white/90">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-6 animate-spin text-foreground/60" />
                <span className="text-sm text-foreground/60">送信中...</span>
              </div>
            </div>
          )}

          <div className="space-y-0">
            <div className="flex items-center border-b border-border/40 px-4">
              <span className="w-10 shrink-0 text-xs text-muted-foreground">To</span>
              <Input value={to} onChange={(e) => setTo(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 h-10 text-sm rounded-none bg-transparent" placeholder="宛先"
                disabled={sendMail.isPending} />
              {!showCcBcc && (
                <button className="shrink-0 text-xs text-primary font-medium hover:text-primary/80 transition-colors" onClick={() => setShowCcBcc(true)}>
                  Cc/Bcc
                </button>
              )}
            </div>
            {showCcBcc && (
              <>
                <div className="flex items-center border-b border-border/40 px-4">
                  <span className="w-10 shrink-0 text-xs text-muted-foreground">Cc</span>
                  <Input value={cc} onChange={(e) => setCc(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0 h-10 text-sm rounded-none bg-transparent"
                    disabled={sendMail.isPending} />
                </div>
                <div className="flex items-center border-b border-border/40 px-4">
                  <span className="w-10 shrink-0 text-xs text-muted-foreground">Bcc</span>
                  <Input value={bcc} onChange={(e) => setBcc(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0 h-10 text-sm rounded-none bg-transparent"
                    disabled={sendMail.isPending} />
                </div>
              </>
            )}
            <div className="flex items-center border-b border-border/40 px-4">
              <span className="w-10 shrink-0 text-xs text-muted-foreground">件名</span>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 h-10 text-sm rounded-none bg-transparent" placeholder="件名"
                disabled={sendMail.isPending} />
            </div>
          </div>

          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="flex-1 resize-none border-0 rounded-none bg-transparent p-4 text-sm leading-relaxed focus-visible:ring-0"
            placeholder="本文を入力..."
            disabled={sendMail.isPending}
          />

          <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5">
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!to || sendMail.isPending}
              className="gap-1.5 rounded-full px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all duration-200"
            >
              {sendMail.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              {sendMail.isPending ? "送信中..." : "送信"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive transition-colors"
              onClick={closeCompose}
              disabled={sendMail.isPending}
            >
              破棄
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
