"""Read public Time.ir yearly HTML using Python's standard-library HTML parser."""
import json
import re
import sys
from html.parser import HTMLParser

MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
DIGITS = str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩', '01234567890123456789')

def normalize(text):
    return re.sub(r'[\u064b-\u065f\u0670]', '', text).replace('ي', 'ی').replace('ك', 'ک').translate(DIGITS).strip()

class YearPage(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.years = set()
        self.months = set()
        self.items = []
        self.item = None
        self.div_depth = 0
        self.capture = None
        self.span_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        ident = attrs.get('id', '')
        if tag == 'input' and ident == 'year':
            self.years.add(normalize(attrs.get('value', '')))
        if re.fullmatch(r'Month_\d+', ident):
            self.months.add(int(ident.split('_')[1]))
        classes = attrs.get('class', '')
        if tag == 'div':
            if self.item is not None:
                self.div_depth += 1
            elif any(c.startswith('EventListItem') for c in classes.split()):
                self.item = {'date': '', 'description': '', 'holiday': False}
                self.div_depth = 1
        if self.item is not None and tag == 'span':
            if self.capture:
                self.span_depth += 1
            elif 'EventListItem' in classes:
                if '__date' in classes:
                    self.capture = 'date'
                elif '__event' in classes:
                    self.capture = 'description'
                if self.capture:
                    self.span_depth = 1
                    self.item['holiday'] |= 'holiday' in classes.lower()

    def handle_endtag(self, tag):
        if self.item is None:
            return
        if tag == 'span' and self.capture:
            self.span_depth -= 1
            if self.span_depth == 0:
                self.capture = None
        if tag == 'div':
            self.div_depth -= 1
            if self.div_depth == 0:
                self.items.append(self.item)
                self.item = None
                self.capture = None

    def handle_data(self, text):
        if self.item is not None and self.capture:
            self.item[self.capture] += text


def parse_year(html, year):
    page = YearPage()
    page.feed(html)
    if page.years != {str(year)}:
        raise ValueError(f'Wrong year returned: requested {year}, found {sorted(page.years)}')
    if page.months != set(range(12)):
        raise ValueError('Incomplete yearly page: expected twelve months')
    rows = {}
    months = {name: index + 1 for index, name in enumerate(MONTHS)}
    months['امرداد'] = 5
    for item in page.items:
        date = normalize(item['date'])
        match = re.fullmatch(r'(\d{1,2})\s+(\S+)', date)
        if not match or match[2] not in months:
            raise ValueError(f'Unrecognized event date: {date}')
        key = f'{year:04d}-{months[match[2]]:02d}-{int(match[1]):02d}'
        title = re.sub(r'\s+', ' ', item['description']).strip()
        if not title:
            raise ValueError('Empty event description')
        row = rows.setdefault(key, {'date': key, 'events': [], 'is_holiday': False})
        event = {'description': title, 'is_holiday': item['holiday']}
        if event not in row['events']:
            row['events'].append(event)
        row['is_holiday'] |= item['holiday']
    if not rows:
        raise ValueError('No events found; page structure may have changed')
    return [rows[key] for key in sorted(rows)]



def parse_action(payload, year):
    """Decode the JSON result embedded in a public React server-action response."""
    decoder = json.JSONDecoder()
    result = None
    for match in re.finditer(r'[0-9a-f]+:\{', payload):
        try:
            obj, _ = decoder.raw_decode(payload[match.end() - 1:])
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict) and isinstance(obj.get('data'), list):
            result = obj
            break
    if result is None or result.get('error') or result.get('status_code') != 200:
        raise ValueError('Missing or unsuccessful yearly-calendar response')
    months = result['data']
    if len(months) != 12 or {month.get('month') for month in months} != set(range(1, 13)):
        raise ValueError('Incomplete yearly response')
    rows = {}
    for month in months:
        if month.get('year') != year:
            raise ValueError('Wrong year returned by yearly action')
        for event in month.get('event_list', []):
            if event.get('jalali_year') != year or event.get('jalali_month') != month['month']:
                raise ValueError('Event year or month mismatch')
            day = event.get('jalali_day')
            if type(day) is not int or type(event.get('is_holiday')) is not bool:
                raise ValueError('Invalid event date or holiday flag')
            title = event.get('title')
            if not isinstance(title, str) or not title.strip():
                raise ValueError('Empty event title')
            key = f'{year:04d}-{month["month"]:02d}-{day:02d}'
            row = rows.setdefault(key, {'date': key, 'events': [], 'is_holiday': False})
            item = {'description': title.strip(), 'is_holiday': event['is_holiday']}
            if item not in row['events']:
                row['events'].append(item)
            row['is_holiday'] |= item['is_holiday']
    if not rows:
        raise ValueError('No events returned')
    return [rows[key] for key in sorted(rows)]


if __name__ == '__main__':
    try:
        function = parse_action if '--rsc' in sys.argv else parse_year
        print(json.dumps(function(sys.stdin.read(), int(sys.argv[-1])), ensure_ascii=False))
    except (ValueError, IndexError, KeyError, TypeError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
