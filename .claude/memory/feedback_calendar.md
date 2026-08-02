---
name: feedback_calendar
description: Googleカレンダー予定作成時のルール
type: feedback
---

カレンダー予定は常に「家族」カレンダーに作成する。
calendarIdはlist_calendarsで「家族」という名前から解決する。

**Why:** 妻と予定共有するため。

**How to apply:** カレンダー予定の作成・更新時に毎回calendarIdを指定する。誤ってprimaryに作った場合は、家族カレンダーに作り直してprimary側を削除する（update_eventではカレンダー間の移動はできない）。
