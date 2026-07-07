import { create } from "zustand";
import type { MessageDetail } from "@/api/types";

type ComposeMode = "new" | "reply" | "replyAll" | "forward";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  composeOpen: boolean;
  composeMode: ComposeMode;
  replySource: MessageDetail | null;
  openCompose: (mode?: ComposeMode, source?: MessageDetail) => void;
  closeCompose: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  composeOpen: false,
  composeMode: "new",
  replySource: null,
  openCompose: (mode = "new", source = undefined) =>
    set({
      composeOpen: true,
      composeMode: mode,
      replySource: source || null,
    }),
  closeCompose: () =>
    set({ composeOpen: false, replySource: null }),
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open, searchQuery: open ? "" : "" }),
}));
