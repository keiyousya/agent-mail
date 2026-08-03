---
name: feedback_mcp_reconnect
description: sakura-mailのMCP接続が切れたら、迂回せずユーザーに再接続を促す。
type: feedback
---

セッション中に sakura-mail の MCP 接続が切れてツールが使えなくなったら、
`/mcp` からの再接続をユーザーに依頼して待つ。田村さんが手動で再接続する。

スクリプトを書いて IMAP を直接叩くなどの迂回策は取らない。

**Why:** 迂回策はリポジトリに一時ファイルを作る上、MCPサーバー経由の想定と挙動が
ずれる。2026-08-03にIMAPを直接叩こうとして中断された。

2026-08-03に切断の原因（ツールの例外でプロセスが落ちる、IMAP接続が張りっぱなし）を
修正済み。頻度は下がるはずだが、切れたときの対応はこれまでと同じ。

**How to apply:** `mcp__sakura-mail__*` が ToolSearch で見つからない場合、
「`/mcp` から sakura-mail を再接続してください」と伝えて待つ。
関連: [[reference_mailboxes]]
