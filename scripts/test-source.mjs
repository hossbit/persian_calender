import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateYear,fetchYear} from './source-data.mjs';
import {calendarWindow} from './window.mjs';
const good=JSON.parse(readFileSync('data/occasions/1405.json','utf8'));
assert.equal(validateYear(good,1405),good);
function altered(change) { const rows=structuredClone(good);change(rows);return rows; }
for(const invalid of ['1405-07-31','1405-01-00','1405-12-30','1404-01-01']) {
 assert.throws(()=>validateYear(altered(rows=>rows[0].date=invalid),1405),/date/);
}
assert.throws(()=>validateYear(altered(rows=>rows[1].date=rows[0].date),1405),/duplicate/);
assert.throws(()=>validateYear(altered(rows=>rows[0].events[0].description=''),1405),/event/);
assert.throws(()=>validateYear(altered(rows=>rows[0].events[0].is_holiday='false'),1405),/event/);
assert.throws(()=>validateYear(good.slice(0,10),1405),/Incomplete/);
let calls=0;
const response=(status,data=good)=>({ok:status===200,status,json:async()=>data});
assert.equal(await fetchYear('https://example.invalid/year',1405,{fetcher:async()=>response(++calls===1?503:200)}),good);
assert.equal(calls,2);
calls=0;
await assert.rejects(fetchYear('https://example.invalid/year',1405,{fetcher:async()=>{calls++;return response(404);}}),/404/);
assert.equal(calls,1);
calls=0;
await assert.rejects(fetchYear('https://example.invalid/year',1405,{fetcher:async()=>{calls++;throw new DOMException('timeout','TimeoutError');}}),/timeout/);
assert.equal(calls,2);
calls=0;
await assert.rejects(fetchYear('https://example.invalid/year',1405,{fetcher:async()=>{calls++;return response(200,[]);}}),/Incomplete/);
assert.equal(calls,1);
const leap=calendarWindow(new Date('2024-02-29T23:59:59Z'));
assert.equal(leap.start.toISOString(),'2014-02-28T00:00:00.000Z');
assert.equal(leap.end.toISOString(),'2034-03-01T00:00:00.000Z');
assert.throws(()=>calendarWindow(new Date('invalid')),/Invalid/);
console.log('Source validation, retry policy and leap-day windows passed.');
