import assert from 'node:assert/strict';
import {event,generate} from './generate.mjs';
import {readFileSync} from 'node:fs';
for(const [date,title] of [['2024-03-20','۱ فروردین ۱۴۰۳'],['2025-03-20','۳۰ اسفند ۱۴۰۳'],['2025-03-21','۱ فروردین ۱۴۰۴'],['2030-03-21','۱ فروردین ۱۴۰۹']]) {
  assert(event(new Date(date+'T00:00:00Z')).find(x=>x.startsWith('SUMMARY')).includes(title),date);
}
const a=generate(new Date('2026-10-14T00:00:00Z'));
const b=generate(new Date('2026-10-15T00:00:00Z'));
assert.equal(a.status.end,'2036-10-14'); assert.equal(b.status.end,'2036-10-15');
assert.equal(a.status.start,'2025-10-13');
assert.deepEqual(event(new Date('2026-10-14')),event(new Date('2026-10-14')));
function validate(ics) {
  assert(!/(?<!\r)\n/.test(ics));
  for(const line of ics.split('\r\n')) assert(Buffer.byteLength(line)<=75);
  const unfolded=ics.replaceAll('\r\n ','');
  const events=unfolded.split('BEGIN:VEVENT\r\n').slice(1);
  assert(events.length>3650);
  const ids=new Set(); let previous;
  for(const block of events) {
    const get=key=>block.split('\r\n').find(l=>l.startsWith(key)).split(':').slice(1).join(':');
    const id=get('UID:'); assert(!ids.has(id)); ids.add(id);
    const start=get('DTSTART;VALUE=DATE:'); const end=get('DTEND;VALUE=DATE:');
    if(previous) assert.equal(start,previous); previous=end;
    for(const key of ['SUMMARY;LANGUAGE=fa:','DESCRIPTION;LANGUAGE=fa:']) {
      const text=get(key); assert(/[\u0600-\u06ff]/.test(text)); assert(!/[A-Za-z0-9]/.test(text.replaceAll('\\n','\n')));
    }
    assert(block.includes('TRANSP:TRANSPARENT')); assert(!block.includes('VALARM'));
  }
}
validate(a.ics); validate(readFileSync('feeds/persian.ics','utf8'));
console.log('All calendar checks passed.');
