import { useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

interface ResizableHandleProps {
  onResize: (delta: number) => void
  className?: string
}

export function ResizableHandle({ onResize, className }: ResizableHandleProps) {
  const dragging = useRef(false)
  const lastX = useRef(0)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragging.current = true
      lastX.current = e.clientX

      const onMouseMove = (e: MouseEvent) => {
        if (!dragging.current) return
        const delta = e.clientX - lastX.current
        lastX.current = e.clientX
        onResize(delta)
      }

      const onMouseUp = () => {
        dragging.current = false
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }

      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    },
    [onResize]
  )

  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        "w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-primary/20 active:bg-primary/30 transition-colors",
        className
      )}
    />
  )
}
