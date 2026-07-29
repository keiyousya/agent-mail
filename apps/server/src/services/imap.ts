import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import sanitizeHtml from "sanitize-html";
import { env } from "../env.js";
import type {
  Address,
  Mailbox,
  MessageDetail,
  MessageEnvelope,
} from "../types/index.js";

function toAddressFromEnvelope(
  addrs: { name?: string; address?: string }[] | undefined
): Address[] {
  if (!addrs) return [];
  return addrs.map((a) => ({
    name: a.name || undefined,
    address: a.address || "",
  }));
}

export class ImapService {
  private client: ImapFlow | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  // Serialize all IMAP operations to prevent concurrent access
  private enqueue<T>(fn: (client: ImapFlow) => Promise<T>): Promise<T> {
    const task = this.queue.then(async () => {
      const client = await this.getClient();
      return fn(client);
    });
    this.queue = task.catch(() => {});
    return task;
  }

  private async getClient(): Promise<ImapFlow> {
    if (this.client && !this.client.usable) {
      this.client = null;
    }
    if (!this.client) {
      this.client = new ImapFlow({
        host: env.IMAP_HOST,
        port: env.IMAP_PORT,
        secure: true,
        auth: {
          user: env.IMAP_USER,
          pass: env.IMAP_PASS,
        },
        logger: false,
      });
      await this.client.connect();
    }
    return this.client;
  }

  async listMailboxes(): Promise<Mailbox[]> {
    return this.enqueue(async (client) => {
      const tree = await client.listTree();
      const results: Mailbox[] = [];

      const walk = (folders: typeof tree.folders) => {
        for (const folder of folders) {
          results.push({
            name: folder.name,
            path: folder.path,
            delimiter: folder.delimiter || "/",
            flags: Array.from(folder.flags || []),
            specialUse: folder.specialUse || undefined,
            total: 0,
            unseen: 0,
          });
          if (folder.folders?.length) {
            walk(folder.folders);
          }
        }
      };
      walk(tree.folders);

      // Fetch status for key folders (specialUse + well-known names)
      const importantNames = ["INBOX", "INBOX.Sent Messages", "INBOX.Sent", "INBOX.Drafts", "INBOX.Draft", "INBOX.Deleted Messages", "INBOX.Trash", "INBOX.spam"];
      const keyFolders = results.filter(
        (mb) => mb.specialUse || importantNames.includes(mb.path)
      );
      for (const mb of keyFolders) {
        try {
          const status = await client.status(mb.path, {
            messages: true,
            unseen: true,
          });
          mb.total = status.messages || 0;
          mb.unseen = status.unseen || 0;
        } catch {
          // Some folders don't support status
        }
      }

      return results;
    });
  }

  async listMessages(
    mailboxPath: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ messages: MessageEnvelope[]; total: number }> {
    return this.enqueue(async (client) => {
      const lock = await client.getMailboxLock(mailboxPath);
      try {
        const status = await client.status(mailboxPath, { messages: true });
        const total = status.messages || 0;

        if (total === 0) {
          return { messages: [], total: 0 };
        }

        const messages: MessageEnvelope[] = [];
        const start = Math.max(1, total - page * limit + 1);
        const end = Math.max(1, total - (page - 1) * limit);
        const range = `${start}:${end}`;

        for await (const msg of client.fetch(range, {
          envelope: true,
          flags: true,
          uid: true,
          bodyStructure: true,
        })) {
          const e = msg.envelope;
          messages.push({
            uid: msg.uid,
            messageId: e.messageId || undefined,
            subject: e.subject || undefined,
            from: toAddressFromEnvelope(e.from),
            to: toAddressFromEnvelope(e.to),
            cc: e.cc ? toAddressFromEnvelope(e.cc) : undefined,
            date: e.date ? new Date(e.date).toISOString() : undefined,
            preview: "",
            flags: Array.from(msg.flags || []),
            hasAttachments: hasAttachmentParts(msg.bodyStructure),
          });
        }

        messages.sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        });

        return { messages, total };
      } finally {
        lock.release();
      }
    });
  }

  async getMessage(
    mailboxPath: string,
    uid: number
  ): Promise<MessageDetail | null> {
    return this.enqueue(async (client) => {
      const lock = await client.getMailboxLock(mailboxPath);
      try {
        const msg = await client.fetchOne(
          String(uid),
          { source: true, envelope: true, flags: true, uid: true },
          { uid: true }
        );

        if (!msg?.source) return null;

        const parsed = await simpleParser(msg.source);
        const e = msg.envelope;

        return {
          uid: msg.uid,
          messageId: e.messageId || undefined,
          subject: e.subject || undefined,
          from: toAddressFromEnvelope(e.from),
          to: toAddressFromEnvelope(e.to),
          cc: e.cc ? toAddressFromEnvelope(e.cc) : undefined,
          bcc: e.bcc ? toAddressFromEnvelope(e.bcc) : undefined,
          replyTo: e.replyTo ? toAddressFromEnvelope(e.replyTo) : undefined,
          date: e.date ? new Date(e.date).toISOString() : undefined,
          preview: (parsed.text || "").slice(0, 200),
          flags: Array.from(msg.flags || []),
          hasAttachments: (parsed.attachments?.length || 0) > 0,
          html: parsed.html
            ? sanitizeHtml(parsed.html, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                  "img", "style", "span", "div",
                  "table", "thead", "tbody", "tr", "td", "th",
                ]),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  img: ["src", "alt", "width", "height", "style"],
                  "*": ["style", "class"],
                },
              })
            : undefined,
          text: parsed.text || undefined,
          attachments: (parsed.attachments || []).map((att, i) => ({
            filename: att.filename || `attachment-${i}`,
            contentType: att.contentType || "application/octet-stream",
            size: att.size || 0,
            partId: String(i),
          })),
          inReplyTo: parsed.inReplyTo
            ? typeof parsed.inReplyTo === "string"
              ? parsed.inReplyTo
              : undefined
            : undefined,
          references: parsed.references
            ? Array.isArray(parsed.references)
              ? parsed.references
              : [parsed.references]
            : undefined,
        };
      } finally {
        lock.release();
      }
    });
  }

  async updateFlags(
    mailboxPath: string,
    uid: number,
    addFlags?: string[],
    removeFlags?: string[]
  ): Promise<void> {
    return this.enqueue(async (client) => {
      const lock = await client.getMailboxLock(mailboxPath);
      try {
        if (addFlags?.length) {
          await client.messageFlagsAdd(String(uid), addFlags, { uid: true });
        }
        if (removeFlags?.length) {
          await client.messageFlagsRemove(String(uid), removeFlags, { uid: true });
        }
      } finally {
        lock.release();
      }
    });
  }

  async moveMessage(
    mailboxPath: string,
    uid: number,
    destination: string
  ): Promise<void> {
    return this.enqueue(async (client) => {
      const lock = await client.getMailboxLock(mailboxPath);
      try {
        await client.messageMove(String(uid), destination, { uid: true });
      } finally {
        lock.release();
      }
    });
  }

  async deleteMessage(mailboxPath: string, uid: number): Promise<void> {
    return this.enqueue(async (client) => {
      const lock = await client.getMailboxLock(mailboxPath);
      try {
        if (mailboxPath.toLowerCase().includes("trash") || mailboxPath.toLowerCase().includes("deleted")) {
          await client.messageFlagsAdd(String(uid), ["\\Deleted"], { uid: true });
          await client.messageDelete(String(uid), { uid: true });
        } else {
          try {
            await client.messageMove(String(uid), "INBOX.Deleted Messages", { uid: true });
          } catch {
            await client.messageFlagsAdd(String(uid), ["\\Deleted"], { uid: true });
            await client.messageDelete(String(uid), { uid: true });
          }
        }
      } finally {
        lock.release();
      }
    });
  }

  async search(
    query: string,
    mailboxPath: string = "INBOX"
  ): Promise<MessageEnvelope[]> {
    return this.enqueue(async (client) => {
      const lock = await client.getMailboxLock(mailboxPath);
      try {
        const uids = await client.search(
          { or: [{ subject: query }, { from: query }, { body: query }] },
          { uid: true }
        );

        if (uids.length === 0) return [];

        const results: MessageEnvelope[] = [];
        const uidRange = uids.slice(-50).join(",");

        for await (const msg of client.fetch(uidRange, {
          envelope: true,
          flags: true,
          uid: true,
          bodyStructure: true,
        }, { uid: true })) {
          const e = msg.envelope;
          results.push({
            uid: msg.uid,
            messageId: e.messageId || undefined,
            subject: e.subject || undefined,
            from: toAddressFromEnvelope(e.from),
            to: toAddressFromEnvelope(e.to),
            date: e.date ? new Date(e.date).toISOString() : undefined,
            preview: "",
            flags: Array.from(msg.flags || []),
            hasAttachments: hasAttachmentParts(msg.bodyStructure),
          });
        }

        results.sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        });

        return results;
      } finally {
        lock.release();
      }
    });
  }

  async purgeMessages(mailboxPath: string, uids: number[]): Promise<number> {
    return this.enqueue(async (client) => {
      const lock = await client.getMailboxLock(mailboxPath);
      try {
        const uidRange = uids.join(",");
        await client.messageFlagsAdd(uidRange, ["\\Deleted"], { uid: true });
        await client.messageDelete(uidRange, { uid: true });
        return uids.length;
      } finally {
        lock.release();
      }
    });
  }

  async appendToSent(rawMessage: Buffer | string): Promise<void> {
    return this.enqueue(async (client) => {
      // Try INBOX.Sent first (specialUse), then INBOX.Sent Messages
      const sentFolders = ["INBOX.Sent Messages", "INBOX.Sent"];
      for (const folder of sentFolders) {
        try {
          await client.append(folder, rawMessage, ["\\Seen"]);
          return;
        } catch {
          // Try next folder
        }
      }
      console.warn("Could not append to any Sent folder");
    });
  }

  async appendToDrafts(rawMessage: Buffer | string): Promise<{ uid: number; folder: string } | null> {
    return this.enqueue(async (client) => {
      const draftFolders = ["INBOX.Drafts", "INBOX.Draft"];
      for (const folder of draftFolders) {
        try {
          const result = await client.append(folder, rawMessage, ["\\Draft", "\\Seen"]);
          return { uid: result.uid, folder };
        } catch {
          // Try next folder
        }
      }
      console.warn("Could not append to any Drafts folder");
      return null;
    });
  }

  async deleteDraft(folder: string, uid: number): Promise<void> {
    return this.enqueue(async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        await client.messageFlagsAdd(String(uid), ["\\Deleted"], { uid: true });
        await client.messageDelete(String(uid), { uid: true });
      } finally {
        lock.release();
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.logout();
      this.client = null;
    }
  }
}

function hasAttachmentParts(structure: any): boolean {
  if (!structure) return false;
  if (structure.disposition === "attachment") return true;
  if (structure.childNodes) {
    return structure.childNodes.some(hasAttachmentParts);
  }
  return false;
}

export const imapService = new ImapService();
