# Cross-platform Persian Calendar (ICS)

[راهنمای فارسی](README.md) · [All subscription options with previews](README.md#subscriptions)

Add Persian (Jalali / Shamsi / Solar Hijri) dates, Iranian holidays and Persian calendar events to Apple Calendar, Thunderbird, Evolution, Google Calendar and Outlook using public ICS calendar subscriptions on Linux, macOS, Windows, Android and iOS. No account or app installation is required for the feeds.

## Other platforms

The same HTTPS feed URLs work with calendar applications that support remote ICS subscriptions:

- **macOS / Apple Calendar:** File → New Calendar Subscription.
- **Linux, Windows, macOS / Thunderbird:** New Calendar → On the Network.
- **Linux / Evolution:** New Calendar → On the Web.
- **Outlook on the web:** Add calendar → Subscribe from web.
- **Google Calendar / Android:** add the URL in a desktop browser using Other calendars → + → From URL, then enable the calendar in the Android app with the same account. The mobile Google Calendar app cannot add a URL subscription directly.
- **Android without Google:** an ICS subscription app such as ICSx⁵ can expose the feed to Android calendar apps.

See the [platform guide and official sources](PLATFORMS.md). Subscribe by URL for ongoing updates; file imports are snapshots. Support depends on the calendar application and its refresh/file-size limits, not just the operating system. The iPhone illustrations are examples of one client's appearance.

## Subscribe on iPhone

Copy a feed URL below, then use either route:

- **Calendar app (iOS 26 and later):** Calendar → Calendars → Add Calendar → Add Subscription Calendar. Paste the URL, tap Find, then finish with Done.
- **Settings:** Settings → Apps → Calendar → Calendar Accounts → Add Account → Other → Add Subscribed Calendar. Paste the URL and complete setup.

Subscribe to the URL instead of downloading and importing the file, so future changes can be fetched automatically.

## Popular ICS feeds

| What you want | Subscription URL |
|---|---|
| Persian daily dates, e.g. «۲۲ مهر» | https://raw.githubusercontent.com/hossbit/persian_calender/main/feeds/persian.ics |
| Iranian occasion-based holidays | https://raw.githubusercontent.com/hossbit/persian_calender/main/feeds/holidays.ics |
| All Persian occasions and holidays | https://raw.githubusercontent.com/hossbit/persian_calender/main/feeds/occasions.ics |
| Persian dates and holidays in one feed | https://raw.githubusercontent.com/hossbit/persian_calender/main/feeds/dates-holidays.ics |
| Persian dates and all occasions in one feed | https://raw.githubusercontent.com/hossbit/persian_calender/main/feeds/combined.ics |

There are **16 subscription options**, including full dates, numeric dates, weekday labels, Fridays, non-holiday occasions and versions excluding occasions in future Persian years. See the [visual guide](README.md#subscriptions).

## How automatic updates work

GitHub Actions rebuilds the feeds daily. Daily dates and Fridays cover a rolling window of **10 years in the past and 10 years in the future**. The subscription URLs stay the same. Continued updates depend on the repository and GitHub Actions remaining active; the fetching schedule is controlled by the calendar client.

Holiday and occasion coverage depends on the source data available for each year. Future-year occasions are labeled «پیش‌بینی» (forecast); these dates may change. Forecasts are supplied by the source, not independently predicted by this project. Emergency and local closures are not guaranteed.

## What appears in Calendar?

Feed names and date labels are in Persian. Events contain only a title and date; no description or location is supplied. Entries are transparent all-day events with no embedded alarms. The feeds display Persian dates as events; they do not change the native month layout or the language of iOS. Pick a separate color for each subscription in Calendar. Avoid subscribing to overlapping feeds if you do not want duplicate entries.

## Source and technical details

Occasion data is fetched directly from the public [Time.ir yearly calendar](https://www.time.ir/event-year) by the collector included in this repository. No intermediary GitHub repository is fetched. These feeds are not presented as an officially verified calendar. See [technical documentation](TECHNICAL.md), [daily-date status](feeds/status.json), and [occasion coverage](feeds/occasions-status.json).

[Apple: calendar subscriptions](https://support.apple.com/102301) · [Apple: calendar accounts in Settings](https://support.apple.com/en-ie/guide/iphone/ipha0d932e96/26/ios/26)
