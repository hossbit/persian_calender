"""Optional independent validation: install icalendar==7.3.0 first."""
from datetime import date, timedelta
from pathlib import Path
from icalendar import Calendar

root = Path(__file__).resolve().parent.parent
for file in sorted((root / 'feeds').glob('*.ics')):
    calendar = Calendar.from_ical(file.read_bytes())
    assert str(calendar['VERSION']) == '2.0', file
    events = calendar.walk('VEVENT')
    assert events, file
    seen = set()
    for event in events:
        assert not event.errors, (file, event.errors)
        uid = str(event['UID'])
        assert uid not in seen, (file, uid)
        seen.add(uid)
        start, end = event.decoded('DTSTART'), event.decoded('DTEND')
        assert type(start) is date and type(end) is date, file
        assert end - start == timedelta(days=1), file
        assert 'DESCRIPTION' not in event and 'LOCATION' not in event, file
        assert str(event['TRANSP']) == 'TRANSPARENT', file
        assert str(event['SUMMARY']).strip(), file
    print(f'{file.name}: {len(events)} events OK')
