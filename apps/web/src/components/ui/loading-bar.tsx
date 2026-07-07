import { useIsFetching, useIsMutating } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

export function LoadingBar() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const isActive = isFetching > 0 || isMutating > 0

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-[2px] transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "h-full bg-foreground/40",
          isActive && "animate-loading-bar"
        )}
      />
    </div>
  )
}
