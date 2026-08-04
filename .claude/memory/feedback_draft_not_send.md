---
name: feedback_draft_not_send
description: メール返信は送信せず下書きボックスに保存する。田村さんが手直しして手動送信する
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d2e5091b-41da-42d0-a433-8e3e84dedd74
  modified: 2026-08-04T01:41:06.174Z
---

メールの返信を頼まれたら、`send_mail` で送らず `save_draft` で下書きに保存する。
田村さんが自分で手直ししてから手動送信する運用。
sakura-mail の下書きは `INBOX.Drafts` に入る（`INBOX.Draft` ではない）。

返信の下書きを作るときは `inReplyTo` と `references` に元メールの Message-ID を
入れて、先方のスレッドにぶら下がるようにする。CC も元スレッドの構成を踏襲する。

**Why:** 本文の細部やニュアンスは田村さん自身が最終判断したい。勝手に送信されると困る。

**How to apply:** 「返信して」「メール作って」と言われたら下書き保存まで。
明示的に「送って」と言われた場合のみ送信する。
文体は [[feedback_email_style]]、送信元の使い分けは [[reference_mailboxes]] を参照。
