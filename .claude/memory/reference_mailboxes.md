---
name: reference_mailboxes
description: 2つのメールボックスの使い分けと、さくらメールのフォルダ構成の癖。
type: reference
---

田村さんはメールボックスを2つ使い分けている。用件に応じて正しい方を使う。

- 慧陽社（法人）: Gmail。claude.ai Connectors の Gmail MCP で操作する。
- 勾当台夕方内科クリニック: さくらのメール。プロジェクトローカルのMCPサーバー
  `sakura-mail`（`apps/server/src/mcp.ts`）で操作する。認証情報はリポジトリ直下の
  `.env`（`IMAP_PASS` / `SMTP_PASS`、gitignore済み）。

クリニック宛の案件がGmailで見つからない場合、sakura-mail側を探す。逆も同様。

### さくらメールのフォルダ構成の注意

specialUseフラグと実際の運用フォルダがずれている。フラグを信じると空振りする。

- 送信済み: `INBOX.Sent Messages` を見る（`INBOX.Sent` は`\Sent`だが0通）
- ゴミ箱: `INBOX.Deleted Messages`（`\Trash`）
- 下書き: `INBOX.Draft`（`\Drafts`）と `INBOX.Drafts` の両方が存在する

### send_mail で返信するとき

- `inReplyTo` / `references` には Message-ID を生の `<...>` 形式で渡す。
  山括弧をHTML実体参照（`&lt;` `&gt;`）にしないこと。2026-08-03の送信で
  `inReplyTo` をエスケープしたまま渡し、ヘッダが壊れた。
- 返信済みかどうかは `INBOX.Sent Messages` の照合と、元メールの `\Answered`
  フラグの両方で確認する。

関連: [[feedback_email_style]]、[[feedback_mcp_reconnect]]
