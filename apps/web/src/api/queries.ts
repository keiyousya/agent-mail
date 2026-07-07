import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiFetch } from "./client";
import type { Mailbox, MessageEnvelope, MessageDetail } from "./types";

export function useMailboxes() {
  return useQuery({
    queryKey: ["mailboxes"],
    queryFn: () => apiFetch<Mailbox[]>("/mailboxes"),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useMessages(mailboxPath: string, page: number = 1) {
  return useQuery({
    queryKey: ["messages", mailboxPath, page],
    queryFn: () =>
      apiFetch<{ messages: MessageEnvelope[]; total: number }>(
        `/mailboxes/${encodeURIComponent(mailboxPath)}/messages?page=${page}&limit=20`
      ),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!mailboxPath,
  });
}

export function useMessage(mailboxPath: string, uid: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["message", mailboxPath, uid],
    queryFn: () =>
      apiFetch<MessageDetail>(
        `/mailboxes/${encodeURIComponent(mailboxPath)}/messages/${uid}`
      ),
    staleTime: 5 * 60 * 1000,
    enabled: !!mailboxPath && uid > 0,
  });

  // When message is fetched and marked as read server-side,
  // update the message list cache to reflect \\Seen flag
  useEffect(() => {
    if (!query.data) return;
    if (!query.data.flags.includes("\\Seen")) return;

    queryClient.setQueriesData<{ messages: MessageEnvelope[]; total: number }>(
      { queryKey: ["messages", mailboxPath] },
      (old) => {
        if (!old) return old;
        const needsUpdate = old.messages.some(
          (m) => m.uid === uid && !m.flags.includes("\\Seen")
        );
        if (!needsUpdate) return old;
        return {
          ...old,
          messages: old.messages.map((m) =>
            m.uid === uid && !m.flags.includes("\\Seen")
              ? { ...m, flags: [...m.flags, "\\Seen"] }
              : m
          ),
        };
      }
    );
  }, [query.data, queryClient, mailboxPath, uid]);

  return query;
}

export function useSearch(query: string, mailbox?: string) {
  return useQuery({
    queryKey: ["search", query, mailbox],
    queryFn: () =>
      apiFetch<MessageEnvelope[]>(
        `/search?q=${encodeURIComponent(query)}${mailbox ? `&mailbox=${encodeURIComponent(mailbox)}` : ""}`
      ),
    enabled: query.length > 0,
    staleTime: 30 * 1000,
  });
}
