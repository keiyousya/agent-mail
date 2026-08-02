---
name: feedback_memory_policy
description: メモリに書いてよい情報の方針。メールアドレス等の連絡先は書かない。
type: feedback
---

メモリファイルにメールアドレスなどの連絡先を書かない。カレンダーIDのような
アドレス形式の識別子も直接書かず、名前から解決する手順を書く。

**Why:** `.claude/memory/` はGitHubのリモートにpushされるため、連絡先が
リポジトリに残るのを避けたい。

**How to apply:** 宛先やIDが必要になったら、その都度Gmailの送受信履歴や
list_calendarsから引く。メモリには「どこから引けるか」だけを書く。
関連: [[reference_ons]]、[[feedback_calendar]]
