import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ImapService } from "./services/imap.js";
import { sendMail, saveDraft } from "./services/smtp.js";

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
    page: z.coerce.number().default(1).describe("ページ番号"),
    limit: z.coerce.number().default(20).describe("1ページあたりの件数"),
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
    uid: z.coerce.number().describe("メールのUID"),
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
    attachments: z.array(z.object({
      filename: z.string().describe("ファイル名"),
      path: z.string().optional().describe("ファイルパス"),
      content: z.string().optional().describe("Base64エンコードされた内容"),
      contentType: z.string().optional().describe("MIMEタイプ"),
      encoding: z.string().optional().describe("エンコーディング（例: base64）"),
    })).optional().describe("添付ファイル"),
    draftFolder: z.string().optional().describe("送信元の下書きフォルダ（下書きから送信時に自動削除）"),
    draftUid: z.coerce.number().optional().describe("送信元の下書きUID（下書きから送信時に自動削除）"),
  },
  async (params) => {
    const result = await sendMail(params);
    return { content: [{ type: "text", text: `送信完了: ${result.messageId}` }] };
  }
);

server.tool(
  "save_draft",
  "メールの下書きを保存する。保存後にUID・フォルダを返すので、send_mailのdraftFolder/draftUidに渡すと送信時に下書きが自動削除される",
  {
    to: z.array(z.string()).describe("宛先メールアドレス"),
    subject: z.string().describe("件名"),
    text: z.string().optional().describe("本文（テキスト）"),
    html: z.string().optional().describe("本文（HTML）"),
    cc: z.array(z.string()).optional().describe("CC"),
    bcc: z.array(z.string()).optional().describe("BCC"),
    inReplyTo: z.string().optional().describe("返信先のMessage-ID"),
    references: z.array(z.string()).optional().describe("参照Message-ID"),
    attachments: z.array(z.object({
      filename: z.string().describe("ファイル名"),
      path: z.string().optional().describe("ファイルパス"),
      content: z.string().optional().describe("Base64エンコードされた内容"),
      contentType: z.string().optional().describe("MIMEタイプ"),
      encoding: z.string().optional().describe("エンコーディング（例: base64）"),
    })).optional().describe("添付ファイル"),
  },
  async (params) => {
    const result = await saveDraft(params);
    if (result) {
      return { content: [{ type: "text", text: `下書きを保存しました (folder: ${result.folder}, uid: ${result.uid})` }] };
    }
    return { content: [{ type: "text", text: "下書きの保存に失敗しました" }] };
  }
);

server.tool(
  "update_flags",
  "メールのフラグを更新する（既読・フラグ等）",
  {
    mailboxPath: z.string().describe("メールボックスのパス"),
    uid: z.coerce.number().describe("メールのUID"),
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
    uid: z.coerce.number().describe("メールのUID"),
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
    uid: z.coerce.number().describe("メールのUID"),
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
