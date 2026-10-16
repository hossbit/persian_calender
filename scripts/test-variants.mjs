import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
for(const name of readdirSync('feeds').filter(n=>n.endsWith('.ics'))) {
 const raw=readFileSync('feeds/'+name,'utf8'); assert(!/(?<!\r)\n/.test(raw));
 for(const line of raw.split('\r\n'))assert(Buffer.byteLength(line)<=75,name);
 const text=raw.replaceAll('\r\n ','');const events=text.split('BEGIN:VEVENT\r\n').slice(1);assert(events.length>10,name);
 const ids=new Set();
 for(const e of events){const uid=e.match(/^UID:(.*)$/m)[1];assert(!ids.has(uid),name);ids.add(uid);assert(e.includes('TRANSP:TRANSPARENT'));assert(!e.includes('VALARM'));assert(!e.includes('DESCRIPTION'));assert(!e.includes('LOCATION'));}
 if(name.includes('-current'))assert(!text.includes('SUMMARY;LANGUAGE=fa:پیش‌بینی:'));
 if(name==='non-holidays.ics')assert(!text.includes('SUMMARY;LANGUAGE=fa:تعطیل:'));
}
const unfold=file=>readFileSync('feeds/'+file,'utf8').replaceAll('\r\n ','');
assert(/SUMMARY;LANGUAGE=fa:.*[۰-۹]{4}/.test(unfold('persian-full.ics')));
assert(/SUMMARY;LANGUAGE=fa:[۰-۹]{4}\/[۰-۹]{2}\/[۰-۹]{2}/.test(unfold('persian-numeric.ics')));
console.log('All subscription variants passed validation.');

assert(/SUMMARY;LANGUAGE=fa:.*[۰-۹]{1,2} [^\r\n۰-۹]+\r/.test(unfold('persian-weekday.ics')));
assert(/SUMMARY;LANGUAGE=fa:[۰-۹]{2}\/[۰-۹]{2}\r/.test(unfold('persian-numeric-short.ics')));
for(const file of ['dates-holidays.ics','combined-current.ics'])assert(unfold(file).includes('UID:persian-'));

const catalogue=JSON.parse(readFileSync('feeds/subscriptions.json','utf8'));
assert.equal(catalogue.calendars.length,16);
assert.equal(new Set(catalogue.calendars.map(c=>c.id)).size,16);
for(const calendar of catalogue.calendars) {
 assert(calendar.name.trim());
 assert.equal(calendar.url,`https://raw.githubusercontent.com/hossbit/persian_calender/main/feeds/${calendar.id}.ics`);
 assert(readFileSync(`feeds/${calendar.id}.ics`,'utf8').includes('BEGIN:VCALENDAR'));
}
