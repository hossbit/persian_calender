import assert from 'node:assert/strict';
import {cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fold} from './generate.mjs';

const root = resolve('.');
const temp = mkdtempSync(join(tmpdir(), 'calendar-simulation-'));
try {
  cpSync(join(root, 'feeds'), join(temp, 'feeds'), {recursive: true});
  const file = join(temp, 'feeds', 'occasions.ics');
  const text = readFileSync(file, 'utf8').replaceAll('\r\n ', '');
  const lines = text.split('\r\n');
  const summaryIndex = lines.findIndex(line => line.startsWith('SUMMARY;LANGUAGE=fa:') && !line.startsWith('SUMMARY;LANGUAGE=fa:پیش‌بینی:'));
  assert(summaryIndex >= 0);
  const uid = lines.slice(0, summaryIndex).findLast(line => line.startsWith('UID:'));
  lines[summaryIndex] += '؛ بررسی پیش‌بینی: آزمایشی';
  writeFileSync(file, lines.map(fold).join('\r\n'));
  const result = spawnSync(process.execPath, [join(root, 'scripts', 'variants.mjs')], {cwd: temp, encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  const current = readFileSync(join(temp, 'feeds', 'occasions-current.ics'), 'utf8').replaceAll('\r\n ', '');
  assert(current.includes(uid + '\r\n'), 'A current event containing the word prediction must not be removed');
  assert(!current.includes('SUMMARY;LANGUAGE=fa:پیش‌بینی:'), 'Future predictions must be excluded');
  const events = name => readFileSync(join(temp, 'feeds', `${name}.ics`), 'utf8')
    .replaceAll('\r\n ', '').split('BEGIN:VEVENT\r\n').slice(1)
    .map(block => ({uid: block.match(/^UID:(.+)\r$/m)[1], date: block.match(/^DTSTART;VALUE=DATE:(\d{8})\r$/m)[1]}));
  const ids = list => list.map(event => event.uid).sort();
  const dates = events('persian');
  const holidays = events('holidays');
  const occasions = events('occasions');
  assert.deepEqual(ids(events('combined')), ids([...dates, ...occasions]));
  assert.deepEqual(ids(events('dates-holidays')), ids([...dates, ...holidays]));
  assert.deepEqual(ids(events('combined-current')), ids([...dates, ...events('occasions-current')]));
  for (const style of ['full', 'numeric', 'weekday', 'numeric-short']) {
    const mapped = events(`persian-${style}`).map(event => ({...event, uid: event.uid.replace(`persian-${style}-`, 'persian-')}));
    assert.deepEqual(mapped, dates, style);
  }
  const fridays = events('fridays');
  const expectedFridays = dates.filter(event => {
    const d = event.date;
    return new Date(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}T00:00:00Z`).getUTCDay() === 5;
  }).map(event => ({...event, uid: event.uid.replace('persian-', 'friday-')}));
  assert.deepEqual(fridays, expectedFridays);
  const holidayDates = new Set(holidays.map(event => event.date));
  assert.deepEqual(ids(events('holidays-with-fridays')), ids([...holidays, ...fridays.filter(event => !holidayDates.has(event.date))]));
} finally {
  rmSync(temp, {recursive: true, force: true});
}
console.log('Subscription generation simulation passed.');
