import { Outlet, useNavigate, useParams } from "@tanstack/react-router"
import { Sidebar } from "@/components/layout/sidebar"
import { ComposeDialog } from "@/components/compose/compose-dialog"
import { LoadingBar } from "@/components/ui/loading-bar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ResizableHandle } from "@/components/ui/resizable-handle"
import { useUIStore } from "@/stores/ui"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useCallback } from "react"

export function App() {
  const navigate = useNavigate()
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const [sidebarWidth, setSidebarWidth] = useState(240)

  const handleSidebarResize = useCallback((delta: number) => {
    setSidebarWidth((w) => Math.max(180, Math.min(400, w + delta)))
  }, [])

  let currentPath = "INBOX"
  try {
    const params = useParams({ from: "/mailbox/$path" })
    currentPath = params.path
  } catch {
    // on index route
  }

  return (
    <TooltipProvider>
      <LoadingBar />
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="fixed left-3 top-3 z-40 md:hidden rounded-lg"
          onClick={toggleSidebar}
        >
          <Menu className="size-4" />
        </Button>

        {/* Sidebar */}
        {sidebarOpen && (
          <>
            <div
              className="h-full flex-shrink-0 md:relative fixed inset-y-0 left-0 z-30 border-r border-border/50"
              style={{ width: sidebarWidth }}
            >
              <Sidebar
                currentPath={currentPath}
                onNavigate={(path) => navigate({ to: "/mailbox/$path", params: { path } })}
              />
            </div>
            <ResizableHandle onResize={handleSidebarResize} className="hidden md:block" />
          </>
        )}

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/15 backdrop-blur-[1px] md:hidden" onClick={toggleSidebar} />
        )}

        {/* Main content */}
        <Outlet />

        {/* Compose */}
        <ComposeDialog />
      </div>
    </TooltipProvider>
  )
}
