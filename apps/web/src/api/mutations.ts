import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { ComposeData, MessageEnvelope } from "./types";

export function useDeleteMessage(mailboxPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: number) =>
      apiFetch<void>(
        `/mailboxes/${encodeURIComponent(mailboxPath)}/messages/${uid}`,
        { method: "DELETE" }
      ),
    onMutate: async (uid) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", mailboxPath],
      });
      const previousData = queryClient.getQueriesData({
        queryKey: ["messages", mailboxPath],
      });
      queryClient.setQueriesData(
        { queryKey: ["messages", mailboxPath] },
        (old: { messages: MessageEnvelope[]; total: number } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.filter((m) => m.uid !== uid),
            total: old.total - 1,
          };
        }
      );
      return { previousData };
    },
    onError: (_err, _uid, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", mailboxPath] });
      queryClient.invalidateQueries({ queryKey: ["mailboxes"] });
    },
  });
}

export function useToggleFlag(mailboxPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      flag,
      add,
    }: {
      uid: number;
      flag: string;
      add: boolean;
    }) =>
      apiFetch<void>(
        `/mailboxes/${encodeURIComponent(mailboxPath)}/messages/${uid}`,
        {
          method: "PATCH",
          body: JSON.stringify(
            add ? { addFlags: [flag] } : { removeFlags: [flag] }
          ),
        }
      ),
    onMutate: async ({ uid, flag, add }) => {
      queryClient.setQueriesData(
        { queryKey: ["messages", mailboxPath] },
        (old: { messages: MessageEnvelope[]; total: number } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.map((m) =>
              m.uid === uid
                ? {
                    ...m,
                    flags: add
                      ? [...m.flags, flag]
                      : m.flags.filter((f) => f !== flag),
                  }
                : m
            ),
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", mailboxPath] });
      queryClient.invalidateQueries({ queryKey: ["mailboxes"] });
    },
  });
}

export function useMoveMessage(mailboxPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, destination }: { uid: number; destination: string }) =>
      apiFetch<void>(
        `/mailboxes/${encodeURIComponent(mailboxPath)}/messages/${uid}`,
        {
          method: "PATCH",
          body: JSON.stringify({ moveTo: destination }),
        }
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["mailboxes"] });
    },
  });
}

export function useSendMail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ComposeData) =>
      apiFetch<{ messageId: string }>("/send", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["mailboxes"] });
    },
  });
}
