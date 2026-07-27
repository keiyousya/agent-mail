import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ImapService } from "./services/imap.js";
import { sendMail } from "./services/smtp.js";

const imap = new ImapService();

const server = new McpServer({
  name: "sakura-mail",
  version: "1.0.0",
});

server.tool("list_mailboxes", "メールボックス一覧を取得する", {}, async () => {
  const mailboxes = await imap.listMailboxes();
  return { content: [{ type: "text", text: JSON.stringify(mailboxes, null, 2) }] };
});

server.tool(
  "list_messages",
  "指定メールボックスのメール一覧を取得する",
  {
    mailboxPath: z.string().default("INBOX").describe("メールボックスのパス"),
    page: z.number().default(1).describe("ページ番号"),
    limit: z.number().default(20).describe("1ページあたりの件数"),
  },
  async ({ mailboxPath, page, limit }) => {
    const result = await imap.listMessages(mailboxPath, page, limit);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "get_message",
  "メールの本文を取得する",
  {
    mailboxPath: z.string().describe("メールボックスのパス"),
    uid: z.number().describe("メールのUID"),
  },
  async ({ mailboxPath, uid }) => {
    const msg = await imap.getMessage(mailboxPath, uid);
    if (!msg) return { content: [{ type: "text", text: "メールが見つかりません" }] };
    return { content: [{ type: "text", text: JSON.stringify(msg, null, 2) }] };
  }
);

server.tool(
  "search_messages",
  "メールを検索する",
  {
    query: z.string().describe("検索クエリ"),
    mailboxPath: z.string().default("INBOX").describe("検索対象のメールボックス"),
  },
  async ({ query, mailboxPath }) => {
    const results = await imap.search(query, mailboxPath);
    return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
  }
);

server.tool(
  "send_mail",
  "メールを送信する",
  {
    to: z.array(z.string()).describe("宛先メールアドレス"),
    subject: z.string().describe("件名"),
    text: z.string().optional().describe("本文（テキスト）"),
    html: z.string().optional().describe("本文（HTML）"),
    cc: z.array(z.string()).optional().describe("CC"),
    bcc: z.array(z.string()).optional().describe("BCC"),
    inReplyTo: z.string().optional().describe("返信先のMessage-ID"),
    references: z.array(z.string()).optional().describe("参照Message-ID"),
  },
  async (params) => {
    const result = await sendMail(params);
    return { content: [{ type: "text", text: `送信完了: ${result.messageId}` }] };
  }
);

server.tool(
  "update_flags",
  "メールのフラグを更新する（既読・フラグ等）",
  {
    mailboxPath: z.string().describe("メールボックスのパス"),
    uid: z.number().describe("メールのUID"),
    addFlags: z.array(z.string()).optional().describe("追加するフラグ"),
    removeFlags: z.array(z.string()).optional().describe("削除するフラグ"),
  },
  async ({ mailboxPath, uid, addFlags, removeFlags }) => {
    await imap.updateFlags(mailboxPath, uid, addFlags, removeFlags);
    return { content: [{ type: "text", text: "フラグを更新しました" }] };
  }
);

server.tool(
  "move_message",
  "メールを別のメールボックスに移動する",
  {
    mailboxPath: z.string().describe("現在のメールボックスのパス"),
    uid: z.number().describe("メールのUID"),
    destination: z.string().describe("移動先のメールボックスのパス"),
  },
  async ({ mailboxPath, uid, destination }) => {
    await imap.moveMessage(mailboxPath, uid, destination);
    return { content: [{ type: "text", text: `移動しました: ${destination}` }] };
  }
);

server.tool(
  "delete_message",
  "メールを削除する",
  {
    mailboxPath: z.string().describe("メールボックスのパス"),
    uid: z.number().describe("メールのUID"),
  },
  async ({ mailboxPath, uid }) => {
    await imap.deleteMessage(mailboxPath, uid);
    return { content: [{ type: "text", text: "削除しました" }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
