---
description: メールチェックを行う。メール確認・メール見て・受信チェック等の指示で自動的に使う。
user_invocable: true
---

以下の2つのメールアカウントを全てチェックし、まとめて報告する。

## 既読管理

メールボックスの未読/既読フラグは使わない（開いただけで読んでいないことがあるため）。

代わりに `.claude/last-mail-check.json` に前回チェック日時を記録し、git管理する。

1. まず `.claude/last-mail-check.json` を読み、前回チェック日時を取得する
2. メールチェック完了後、現在日時で `.claude/last-mail-check.json` を更新してコミットする

## 1. 慧陽社 (Gmail: tamurakeito@keiyousya.com)

Gmail MCP の `search_threads` を使い、`in:inbox` で最新50件を取得する。

## 2. クリニック (さくらメール: tamurakeito@koutoudai-yugata-naika.clinic)

sakura-mail MCP の `list_messages` を使い、INBOX の最新50件を取得する。

## 報告フォーマット

取得したメールを以下の形式で整理する。

- 前回チェック以降に届いたメールを「新着」として優先表示する
- カテゴリ別に分類（要対応、請求・支払い、通知、広告・プロモーション等）
- 各メールには日付、送信元、件名を表示
- 対応が必要なものがあれば末尾に要注意事項としてまとめる
