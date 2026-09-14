import { config } from "dotenv";
import { z } from "zod";
import { resolve } from "path";

config({ path: resolve(import.meta.dirname, "../../../.env") });

export const env = z
  .object({
    MAIL_ACCOUNT: z.enum(["sakura", "icloud"]).default("sakura"),
    PORT: z.coerce.number().default(3001),
  })
  .parse(process.env);

interface ServerConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export interface MailAccount {
  name: string;
  imap: ServerConfig;
  smtp: ServerConfig;
  // Candidate folders in priority order; the first one that works is used
  folders: {
    sent: string[];
    drafts: string[];
    trash: string[];
    junk: string[];
  };
}

function sakuraAccount(): MailAccount {
  const e = z
    .object({
      IMAP_HOST: z.string().default("koutoudaiyugatan.sakura.ne.jp"),
      IMAP_PORT: z.coerce.number().default(993),
      IMAP_USER: z.string().default("tamurakeito@koutoudai-yugata-naika.clinic"),
      IMAP_PASS: z.string(),
      SMTP_HOST: z.string().default("koutoudaiyugatan.sakura.ne.jp"),
      SMTP_PORT: z.coerce.number().default(587),
      SMTP_USER: z.string().default("tamurakeito@koutoudai-yugata-naika.clinic"),
      SMTP_PASS: z.string(),
    })
    .parse(process.env);
  return {
    name: "sakura",
    imap: { host: e.IMAP_HOST, port: e.IMAP_PORT, user: e.IMAP_USER, pass: e.IMAP_PASS },
    smtp: { host: e.SMTP_HOST, port: e.SMTP_PORT, user: e.SMTP_USER, pass: e.SMTP_PASS },
    // specialUse flags do not match the folders actually in use on Sakura
    folders: {
      sent: ["INBOX.Sent Messages", "INBOX.Sent"],
      drafts: ["INBOX.Drafts", "INBOX.Draft"],
      trash: ["INBOX.Deleted Messages", "INBOX.Trash"],
      junk: ["INBOX.spam"],
    },
  };
}

function icloudAccount(): MailAccount {
  // ICLOUD_PASS must be an app-specific password (appleid.apple.com)
  const e = z
    .object({
      ICLOUD_USER: z.string().email(),
      ICLOUD_PASS: z.string(),
    })
    .parse(process.env);
  return {
    name: "icloud",
    imap: { host: "imap.mail.me.com", port: 993, user: e.ICLOUD_USER, pass: e.ICLOUD_PASS },
    smtp: { host: "smtp.mail.me.com", port: 587, user: e.ICLOUD_USER, pass: e.ICLOUD_PASS },
    folders: {
      sent: ["Sent Messages"],
      drafts: ["Drafts"],
      trash: ["Deleted Messages"],
      junk: ["Junk"],
    },
  };
}

export const account = env.MAIL_ACCOUNT === "icloud" ? icloudAccount() : sakuraAccount();
