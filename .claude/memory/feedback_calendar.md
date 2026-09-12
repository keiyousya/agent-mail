---
name: feedback_calendar
description: Googleカレンダー予定作成時のルール
type: feedback
---

カレンダー予定は常に「家族」カレンダーに作成する。
calendarIdはlist_calendarsで「家族」という名前から解決する。

終日予定を作るときは `startTime` / `endTime` を **`Z`（UTC）表記**で渡す
（例: 2026-09-14 の終日なら `2026-09-14T00:00:00Z` 〜 `2026-09-15T00:00:00Z`）。
`+09:00` のオフセットを付けると前日にずれる。既存の終日予定もすべて Z 表記で入っている。

タスク的な予定は終日・`AVAILABILITY_FREE` で入れるのが既存の運用に合う。

**Why:** 妻と予定共有するため。

**How to apply:** カレンダー予定の作成・更新時に毎回calendarIdを指定する。誤ってprimaryに作った場合は、家族カレンダーに作り直してprimary側を削除する（update_eventではカレンダー間の移動はできない）。
