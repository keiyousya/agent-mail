import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-neutral-200/80",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

function SkeletonText({ className, lines = 3, ...props }: React.ComponentProps<"div"> & { lines?: number }) {
  const widths = ["w-full", "w-4/5", "w-3/5", "w-2/3", "w-5/6", "w-1/2"]
  return (
    <div className={cn("space-y-2.5", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3 rounded", widths[i % widths.length])} />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonText }
