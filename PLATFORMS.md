# استفاده از تقویم شمسی روی سیستم‌عامل‌های مختلف

همان [۱۶ لینک اشتراک](README.md#subscriptions) برای برنامه‌های سازگار با iCalendar / ICS استفاده می‌شوند. سیستم‌عامل به‌تنهایی کافی نیست؛ برنامه باید اشتراک یک تقویم اینترنتی را پشتیبانی کند.

**برای به‌روزرسانی خودکار، لینک HTTPS را Subscribe کن. دانلود و Import یک فایل، فقط نسخه‌ای ثابت از آن می‌سازد.**

لینک نمونهٔ تاریخ کوتاه:

```text
https://raw.githubusercontent.com/hossbit/persian_calender/main/feeds/persian.ics
```

## آیفون و آیپد — Apple Calendar

از برنامه:

`Calendar → Calendars → Add Calendar → Add Subscription Calendar`

در iOS / iPadOS 26 و جدیدتر، لینک را وارد کن، Find و سپس Done را بزن. در نسخه‌های قدیمی‌تر ممکن است Subscribe و Add نمایش داده شود.

از تنظیمات:

`Settings → Apps → Calendar → Calendar Accounts → Add Account → Other → Add Subscribed Calendar`

اگر می‌خواهی روی دستگاه‌های اپلِ همان حساب هم نمایش داده شود، حساب اشتراک را iCloud انتخاب کن.

[راهنمای اپل](https://support.apple.com/102301)

## مک — Apple Calendar

`Calendar → File → New Calendar Subscription`

لینک را وارد کن و Subscribe را بزن. نام و رنگ را انتخاب کن و Auto-refresh را تنظیم کن. برای اشتراک روی دستگاه‌های اپلِ همان حساب، Location را iCloud بگذار؛ On My Mac فقط مربوط به همان مک است.

[راهنمای رسمی macOS](https://support.apple.com/guide/calendar/share-calendars-icl32362/mac)

## لینوکس، ویندوز و مک — Thunderbird

`File → New → Calendar → On the Network`

لینک را در Location وارد کن، گزینهٔ «This location doesn't require credentials» را در صورت نمایش فعال کن، Find Calendars و سپس Subscribe را بزن. نام و رنگ را می‌توانی تغییر بدهی. برنامه را در حالت Calendar باز کن؛ نام منوها ممکن است با نسخه و زبان برنامه فرق داشته باشد.

[راهنمای Mozilla](https://support.mozilla.org/en-US/kb/creating-new-calendars)

## لینوکس — Evolution

`File → New → Calendar → On the Web`

نام تقویم و لینک HTTPS را وارد و ذخیره کن. این فید عمومی است و به نام کاربری یا گذرواژه نیاز ندارد. در صورت نیاز، نمایش آفلاین و دورهٔ دریافت را در تنظیمات همان تقویم تنظیم کن.

[راهنمای GNOME Evolution](https://help.gnome.org/evolution/calendar-webdav.html)

## ویندوز و مرورگر — Outlook.com / Outlook on the web

`Calendar → Add calendar → Subscribe from web`

لینک را وارد کن و مراحل ذخیره‌سازی را ادامه بده. بخش Subscribe from web را انتخاب کن؛ Upload from file به‌روزرسانی خودکار ندارد. همین روش از مرورگر روی سیستم‌عامل‌های دیگر نیز قابل استفاده است. نام منوهای نسخه‌های دسکتاپ Outlook ممکن است متفاوت باشد.

[راهنمای Microsoft](https://support.microsoft.com/en-us/outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web)

## اندروید و مرورگر — Google Calendar

ابتدا در **مرورگر کامپیوتر**، با همان حساب Google گوشی برو به:

`calendar.google.com → Other calendars → + → From URL`

لینک HTTPS را وارد کن و Add calendar را بزن. سپس در برنامهٔ Google Calendar اندروید، همان حساب را انتخاب و نمایش تقویم اضافه‌شده را فعال کن. تنظیمات همگام‌سازی آن تقویم را در صورت نیاز بررسی کن. افزودن اولیهٔ اشتراک URL در خود برنامهٔ Google Calendar موبایل انجام نمی‌شود.

[راهنمای Google](https://support.google.com/calendar/answer/37100?hl=en)

### اندروید بدون وابستگی به Google Calendar

یک برنامهٔ اشتراک ICS مانند [ICSx⁵](https://icsx5.bitfire.at/) می‌تواند فید اینترنتی را به‌صورت تقویم اندروید در دسترس برنامه‌های تقویم قرار بدهد. لینک HTTPS را در برنامهٔ اشتراک وارد کن و تقویم ایجادشده را در برنامهٔ تقویم خودت نمایش بده. امکانات و شرایط نصب را در صفحهٔ سازنده بررسی کن.

## سایر برنامه‌ها

در برنامه‌هایی که گزینهٔ Internet Calendar، iCalendar، ICS Subscription، Subscribe from URL یا Webcal دارند، همان لینک HTTPS را امتحان کن. این فید، حساب CalDAV نیست و برای افزودنش نباید نام سرور یا اعتبارنامهٔ CalDAV ساخت.

برای استفادهٔ آفلاین یا برنامه‌ای که فقط Import دارد، دانلود فایل ICS ممکن است؛ اما تغییرات بعدی به آن نسخه اضافه نمی‌شود. فایل بزرگِ بازهٔ بیست‌ساله ممکن است در بعضی برنامه‌ها محدودیت حجم یا کندی ایجاد کند؛ در این حالت از فید سبک‌تر، مثل فقط تعطیلات، استفاده کن.

## نمایش و به‌روزرسانی

- متن رویدادها فارسی و تمام‌روز است؛ بدون توضیحات اضافی، مکان و هشدار تعبیه‌شده.
- رویدادها، تاریخ شمسی را نمایش می‌دهند؛ رابط و چیدمان ماه‌های برنامهٔ میزبان را عوض نمی‌کنند.
- متن فارسی نیازمند پشتیبانی قلم و راست‌به‌چپ برنامه است. اندازه، رنگ و فونت را برنامهٔ میزبان تعیین می‌کند.
- دریافت فایل‌ها و بازتولید آن‌ها در مخزن روزانه است؛ زمان دریافت توسط هر برنامه یا سرویس را همان برنامه تعیین می‌کند. Outlook ممکن است بیش از ۲۴ ساعت برای دریافت تغییرات زمان ببرد.
- از افزودن هم‌زمان حالت‌های هم‌پوشان خودداری کن تا رویداد تکراری نبینی.

## وضعیت بررسی

روش‌های بالا بر اساس راهنمای رسمی سازندگان نوشته شده‌اند. فایل‌ها از قالب مشترک ICS استفاده می‌کنند؛ این به معنای آزمایش روی تمام نسخه‌های همهٔ برنامه‌ها نیست. تست ساختار فایل و خواندن با کتابخانهٔ مستقل، جدا از آزمایش رابط واقعی هر برنامه است.
