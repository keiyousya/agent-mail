---
description: メールの下書きを作成する。メール作って・返信して・下書き作成等の指示で自動的に使う。
user_invocable: true
---

メールの下書きを作成する前に、以下のファイルを必ず読み込んで文体ルールを把握してから本文を書く。

## 事前読み込みファイル（必須）

以下の3ファイルを毎回 Read ツールで読み込むこと。キャッシュせず、最新の内容を参照する。

1. `.claude/memory/feedback_email_style.md` — 宛名・挨拶・本文・結びの基本ルール
2. `.claude/memory/feedback_email_editing_habits.md` — 田村さんの手直し傾向（38項目）
3. `.claude/memory/feedback_draft_not_send.md` — 下書き保存の運用ルール・引用ブロック必須

## 送信元の判別

- クリニック業務 → sakura-mail の `save_draft` を使う
- 慧陽社（法人）業務 → Gmail MCP の `create_draft` を使う
- 判断がつかない場合はユーザーに確認する

詳細は `.claude/memory/reference_mailboxes.md` を参照。

## 作成手順

1. 上記3ファイルを Read で読み込む
2. CLAUDE.md の「Email Writing Style」セクションも参照する
3. 文体ルールに従って本文を作成する
4. 返信の場合は本文末尾に元メールの引用ブロックを付ける（Apple Mail形式）
5. `save_draft` または `create_draft` で下書きを保存する
6. **絶対に `send_mail` / `send_message` / `reply` は使わない**
